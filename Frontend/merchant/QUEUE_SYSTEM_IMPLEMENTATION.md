# Queue System Implementation Guide

**Purpose:** Implement background job processing for async tasks using BullMQ + Redis

---

## 🎯 Why We Need Queues

**Current Problems:**
- ❌ Email sending blocks request/response
- ❌ No retry mechanism for failed operations
- ❌ Image/video processing times out
- ❌ Bulk operations freeze the UI
- ❌ No way to track job progress
- ❌ Scheduled tasks have no persistence

**Solution:** BullMQ - Production-ready queue system built on Redis

---

## 📦 Installation

```bash
pnpm add bullmq
pnpm add -D @types/bullmq
```

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────┐     ┌──────────────┐
│ API Routes  │────▶│  Queues  │────▶│   Workers    │
│ (Add Jobs)  │     │ (Redis)  │     │ (Process)    │
└─────────────┘     └──────────┘     └──────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Retry Logic  │
                  │ Monitoring   │
                  └──────────────┘
```

---

## 🚀 Implementation

### Step 1: Create Queue Definitions

```typescript
// src/lib/queues/email-queue.ts
import { Queue, Worker, Job } from "bullmq";
import { getRedis } from "@/lib/redis";
import { logger } from "@vayva/shared";
import { ResendEmailService } from "@/lib/email/resend";

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  userId?: string;
  storeId?: string;
}

const connection = getRedis();

export const emailQueue = new Queue("emails", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, 10s, 20s
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 jobs
    },
    removeOnFail: {
      age: 24 * 60 * 60, // Remove failed jobs older than 24h
    },
  },
});

export const emailWorker = new Worker(
  "emails",
  async (job: Job<EmailJobData>) => {
    logger.info("[EMAIL_QUEUE] Processing job", {
      jobId: job.id,
      to: job.data.to,
      attempt: job.attemptsMade,
    });

    try {
      await ResendEmailService.sendTransactionalEmail(job.data);
      
      logger.info("[EMAIL_QUEUE] Email sent successfully", {
        jobId: job.id,
        to: job.data.to,
      });
    } catch (error) {
      logger.error("[EMAIL_QUEUE] Failed to send email", {
        jobId: job.id,
        error,
      });
      throw error; // Will trigger retry
    }
  },
  {
    connection,
    concurrency: 5, // Process 5 emails in parallel
  }
);

// Helper function to add jobs
export async function queueEmail(data: EmailJobData): Promise<string> {
  const job = await emailQueue.add("send-email", data, {
    priority: data.userId ? 1 : 2, // Prioritize user-triggered emails
  });
  
  logger.info("[EMAIL_QUEUE] Job added", { jobId: job.id });
  return job.id;
}
```

### Step 2: Create Other Queues

```typescript
// src/lib/queues/image-processing-queue.ts
import { Queue, Worker, Job } from "bullmq";
import { getRedis } from "@/lib/redis";
import sharp from "sharp";

export interface ImageProcessingData {
  inputPath: string;
  outputPath: string;
  transformations: Array<{
    type: "resize" | "crop" | "rotate";
    params: Record<string, number>;
  }>;
}

export const imageQueue = new Queue("image-processing", {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 2,
    timeout: 30000, // 30 seconds
  },
});

export const imageWorker = new Worker(
  "image-processing",
  async (job: Job<ImageProcessingData>) => {
    let image = sharp(job.data.inputPath);
    
    for (const transform of job.data.transformations) {
      if (transform.type === "resize") {
        image = image.resize(transform.params.width, transform.params.height);
      }
      // ... other transforms
    }
    
    await image.toFile(job.data.outputPath);
  },
  {
    connection: getRedis(),
    concurrency: 2, // Limit concurrent image processing
  }
);
```

```typescript
// src/lib/queues/report-generation-queue.ts
import { Queue, Worker } from "bullmq";
import { getRedis } from "@/lib/redis";
import { prisma } from "@vayva/db";
import Papa from "papaparse";

export interface ReportGenerationData {
  reportType: "sales" | "inventory" | "customers";
  storeId: string;
  startDate: Date;
  endDate: Date;
  format: "csv" | "pdf" | "xlsx";
  userId: string;
}

export const reportQueue = new Queue("report-generation", {
  connection: getRedis(),
  defaultJobOptions: {
    attempts: 1, // Don't retry report generation
    timeout: 300000, // 5 minutes
  },
});

export const reportWorker = new Worker(
  "report-generation",
  async (job) => {
    // Generate report based on type
    let data;
    switch (job.data.reportType) {
      case "sales":
        data = await prisma.order.findMany({ /* ... */ });
        break;
      case "inventory":
        data = await prisma.product.findMany({ /* ... */ });
        break;
      // ...
    }
    
    // Convert to CSV/PDF/XLSX
    const csv = Papa.unparse(data);
    
    // Upload to S3 or send via email
    // ...
  },
  {
    connection: getRedis(),
    concurrency: 1, // One report at a time
  }
);
```

### Step 3: Main Queue Manager

```typescript
// src/lib/queues/index.ts
export * from "./email-queue";
export * from "./image-processing-queue";
export * from "./report-generation-queue";

import { emailQueue, imageQueue, reportQueue } from "./index";

export class QueueManager {
  static async getQueueStats() {
    const [emailWaiting, emailActive, emailCompleted, emailFailed,
           imageWaiting, imageActive, imageCompleted, imageFailed,
           reportWaiting, reportActive, reportCompleted, reportFailed] = 
      await Promise.all([
        emailQueue.getWaitingCount(),
        emailQueue.getActiveCount(),
        emailQueue.getCompletedCount(),
        emailQueue.getFailedCount(),
        imageQueue.getWaitingCount(),
        imageQueue.getActiveCount(),
        imageQueue.getCompletedCount(),
        imageQueue.getFailedCount(),
        reportQueue.getWaitingCount(),
        reportQueue.getActiveCount(),
        reportQueue.getCompletedCount(),
        reportQueue.getFailedCount(),
      ]);

    return {
      emails: {
        waiting: emailWaiting,
        active: emailActive,
        completed: emailCompleted,
        failed: emailFailed,
      },
      images: {
        waiting: imageWaiting,
        active: imageActive,
        completed: imageCompleted,
        failed: imageFailed,
      },
      reports: {
        waiting: reportWaiting,
        active: reportActive,
        completed: reportCompleted,
        failed: reportFailed,
      },
    };
  }

  static async clearAllQueues() {
    await Promise.all([
      emailQueue.obliterate({ force: true }),
      imageQueue.obliterate({ force: true }),
      reportQueue.obliterate({ force: true }),
    ]);
  }
}
```

### Step 4: Update API Routes to Use Queues

```typescript
// Example: Update account deletion to use email queue
import { queueEmail } from "@/lib/queues/email-queue";

export async function requestDeletion(storeId: string, userId: string) {
  // ... existing logic
  
  // Instead of blocking, queue the email
  await queueEmail({
    to: user.email,
    subject: `Account Deletion Scheduled - ${storeName}`,
    html: generateEmailHTML(),
    userId,
    storeId,
  });
  
  return { success: true };
}
```

### Step 5: Create Worker Server

```typescript
// src/workers/run-workers.ts
#!/usr/bin/env node
/**
 * Standalone worker process
 * Run with: pnpm workers
 */

import { emailWorker, imageWorker, reportWorker } from "@/lib/queues";
import { logger } from "@vayva/shared";

async function main() {
  logger.info("[WORKERS] Starting background workers...");
  
  emailWorker.on("completed", (job) => {
    logger.info(`[WORKERS] Email job ${job.id} completed`);
  });
  
  emailWorker.on("failed", (job, err) => {
    logger.error(`[WORKERS] Email job ${job?.id} failed:`, err);
  });
  
  imageWorker.on("completed", (job) => {
    logger.info(`[WORKERS] Image job ${job.id} completed`);
  });
  
  reportWorker.on("completed", (job) => {
    logger.info(`[WORKERS] Report job ${job.id} completed`);
  });
  
  // Handle graceful shutdown
  process.on("SIGTERM", async () => {
    logger.info("[WORKERS] Shutting down...");
    await Promise.all([
      emailWorker.close(),
      imageWorker.close(),
      reportWorker.close(),
    ]);
    process.exit(0);
  });
  
  logger.info("[WORKERS] Workers running and processing jobs");
}

main().catch(console.error);
```

### Step 6: Add to package.json

```json
{
  "scripts": {
    "workers": "tsx src/workers/run-workers.ts",
    "workers:prod": "NODE_ENV=production pm2 start src/workers/run-workers.ts"
  }
}
```

---

## 📊 Monitoring Dashboard

Create `/app/dashboard/queues/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";

export default function QueueDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/queues/stats");
      const data = await res.json();
      setStats(data);
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <h3>Email Queue</h3>
        <p>Waiting: {stats.emails.waiting}</p>
        <p>Active: {stats.emails.active}</p>
        <p>Failed: {stats.emails.failed}</p>
      </div>
      {/* Similar for images and reports */}
    </div>
  );
}
```

---

## 🎯 Usage Examples

### Send Email (Non-blocking)

```typescript
// Before (blocking)
await ResendEmailService.sendTransactionalEmail({...});
return Response.json({ success: true });

// After (non-blocking)
await queueEmail({...});
return Response.json({ 
  success: true, 
  message: "Email queued for delivery" 
});
```

### Generate Report with Progress

```typescript
// Create job
const job = await reportQueue.add("generate-report", {
  reportType: "sales",
  storeId: "store_123",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
  format: "csv",
  userId: "user_456",
});

// Track progress
job.updateProgress(50); // From worker

// Client can poll status
GET /api/jobs/{jobId}/status
```

---

## ✅ Benefits Delivered

1. **Non-blocking Operations** - API responds instantly
2. **Automatic Retries** - Failed jobs retry automatically
3. **Job Progress Tracking** - Users see real-time progress
4. **Scalability** - Add more workers as needed
5. **Persistence** - Jobs survive server restarts
6. **Rate Limiting** - Control processing speed
7. **Monitoring** - Full visibility into job status
8. **Error Handling** - Centralized error management

---

## 🔧 Configuration

### Environment Variables

```bash
# Queue Configuration
QUEUE_CONCURRENCY_EMAILS=5
QUEUE_CONCURRENCY_IMAGES=2
QUEUE_CONCURRENCY_REPORTS=1

QUEUE_RETRIES_EMAILS=3
QUEUE_RETRIES_IMAGES=2
QUEUE_RETRIES_REPORTS=1

QUEUE_TIMEOUT_EMAILS=30000
QUEUE_TIMEOUT_IMAGES=60000
QUEUE_TIMEOUT_REPORTS=300000
```

---

## 📈 Next Steps

1. ✅ Install BullMQ
2. ✅ Create queue definitions
3. ✅ Migrate email sending to queues
4. ✅ Add image processing queue
5. ✅ Add report generation queue
6. ✅ Create monitoring dashboard
7. ✅ Set up alerts for failed jobs
8. ✅ Configure PM2 for worker processes

---

**Estimated Implementation Time:** 1-2 days  
**Priority:** HIGH  
**Business Impact:** Eliminates timeout errors, improves UX dramatically
