import { exec } from "child_process";
import { writeFileSync } from "node:fs";
import { promisify } from "util";
import { Client } from "minio";
import { logger } from "@vayva/shared";
import { prisma } from "@vayva/db";

const execAsync = promisify(exec);

interface BackupConfig {
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  s3Bucket: string;
  s3Endpoint: string;
  s3AccessKey: string;
  s3SecretKey: string;
  retentionDays: number;
}

/**
 * Worker job handler for database backups
 * Runs daily pg_dump and uploads to MinIO/S3
 */
export async function handleDatabaseBackup(
  job: { data: Partial<BackupConfig> }
): Promise<{ success: boolean; backupKey?: string; error?: string }> {
  const config: BackupConfig = {
    dbHost: job.data.dbHost || process.env.DATABASE_HOST || "localhost",
    dbPort: job.data.dbPort || process.env.DATABASE_PORT || "5432",
    dbName: job.data.dbName || process.env.DATABASE_NAME || "vayva",
    dbUser: job.data.dbUser || process.env.DATABASE_USER || "vayva",
    dbPassword: job.data.dbPassword || process.env.DATABASE_PASSWORD || "",
    s3Bucket: job.data.s3Bucket || process.env.BACKUP_S3_BUCKET || "backups",
    s3Endpoint: job.data.s3Endpoint || process.env.S3_ENDPOINT || "",
    s3AccessKey: job.data.s3AccessKey || process.env.S3_ACCESS_KEY || "",
    s3SecretKey: job.data.s3SecretKey || process.env.S3_SECRET_KEY || "",
    retentionDays: job.data.retentionDays || 7,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `vayva-backup-${config.dbName}-${timestamp}.sql.gz`;
  const tempPath = `/tmp/${backupFileName}`;

  try {
    // Run pg_dump with compression
    logger.info("Starting database backup", { db: config.dbName, timestamp });
    
    const pgDumpCmd = `PGPASSWORD="${config.dbPassword}" pg_dump \
      -h ${config.dbHost} \
      -p ${config.dbPort} \
      -U ${config.dbUser} \
      -d ${config.dbName} \
      --no-owner \
      --no-acl \
      --clean \
      --if-exists \
      --format=plain | gzip > ${tempPath}`;

    await execAsync(pgDumpCmd, { timeout: 300000 }); // 5 minute timeout

    // Check file was created
    const { stdout: fileSize } = await execAsync(`stat -f%z ${tempPath} 2>/dev/null || stat -c%s ${tempPath}`);
    const sizeInMB = Math.round(parseInt(fileSize.trim()) / 1024 / 1024);
    
    logger.info("Backup file created", { sizeMB: sizeInMB, path: tempPath });

    // Upload to MinIO
    const minioClient = new Client({
      endPoint: config.s3Endpoint.replace(/^https?:\/\//, "").split("/")[0],
      port: parseInt(config.s3Endpoint.split(":").pop() || "443"),
      useSSL: config.s3Endpoint.startsWith("https"),
      accessKey: config.s3AccessKey,
      secretKey: config.s3SecretKey,
      region: "us-east-1",
    });

    const fileContent = await execAsync(`cat ${tempPath}`).then(r => Buffer.from(r.stdout, "binary"));
    
    const uploadKey = `database/${backupFileName}`;
    await minioClient.putObject(config.s3Bucket, uploadKey, fileContent, {
      "Content-Type": "application/gzip",
      "x-amz-meta-db-name": config.dbName,
      "x-amz-meta-timestamp": timestamp,
      "x-amz-meta-size-mb": String(sizeInMB),
    });

    logger.info("Backup uploaded to S3", { key: uploadKey, sizeMB: sizeInMB });

    // Log to database
    await prisma.$executeRaw`
      INSERT INTO audit_log (
        id, action, entity_type, entity_id, 
        changes, metadata, performed_by_id, created_at
      ) VALUES (
        gen_random_uuid(), 
        'DB_BACKUP_COMPLETE',
        'system',
        NULL,
        '{}'::jsonb,
        jsonb_build_object(
          'backup_key', ${uploadKey},
          'size_mb', ${sizeInMB},
          'timestamp', ${timestamp},
          'db_name', ${config.dbName}
        ),
        NULL,
        NOW()
      )
    `.catch(() => {
      // Silent fail on audit log
    });

    // Cleanup old backups
    await cleanupOldBackups(s3Client, config.s3Bucket, config.retentionDays);

    // Cleanup temp file
    await execAsync(`rm -f ${tempPath}`).catch(() => {
      // Ignore cleanup errors
    });

    return { success: true, backupKey: uploadKey };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Database backup failed", { error: errorMessage, db: config.dbName });

    // Cleanup on failure
    await execAsync(`rm -f ${tempPath}`).catch(() => {
      // Ignore cleanup errors
    });

    // Log failure
    await prisma.$executeRaw`
      INSERT INTO audit_log (
        id, action, entity_type, entity_id, 
        changes, metadata, performed_by_id, created_at
      ) VALUES (
        gen_random_uuid(), 
        'DB_BACKUP_FAILED',
        'system',
        NULL,
        '{}'::jsonb,
        jsonb_build_object(
          'error', ${errorMessage},
          'timestamp', ${new Date().toISOString()},
          'db_name', ${config.dbName}
        ),
        NULL,
        NOW()
      )
    `.catch(() => {
      // Silent fail
    });

    return { success: false, error: errorMessage };
  }
}

/**
 * Cleanup backups older than retention period
 */
async function cleanupOldBackups(
  s3Client: S3Client,
  bucket: string,
  retentionDays: number
): Promise<void> {
  try {
    const { ListObjectsV2Command, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // List all backup objects
    const listResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: "database/",
      })
    );

    const objectsToDelete = (listResponse.Contents || []).filter((obj) => {
      if (!obj.LastModified) return false;
      return obj.LastModified < cutoffDate;
    });

    // Delete old backups
    for (const obj of objectsToDelete) {
      if (obj.Key) {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: obj.Key,
          })
        );
        logger.info("Deleted old backup", { key: obj.Key });
      }
    }

    logger.info("Backup cleanup complete", { deleted: objectsToDelete.length });
  } catch (error) {
    logger.error("Backup cleanup failed", { error });
  }
}

/**
 * Restore database from backup
 */
export async function restoreDatabase(
  backupKey: string,
  config: Partial<BackupConfig>
): Promise<{ success: boolean; error?: string }> {
  const fullConfig: BackupConfig = {
    dbHost: config.dbHost || process.env.DATABASE_HOST || "localhost",
    dbPort: config.dbPort || process.env.DATABASE_PORT || "5432",
    dbName: config.dbName || process.env.DATABASE_NAME || "vayva",
    dbUser: config.dbUser || process.env.DATABASE_USER || "vayva",
    dbPassword: config.dbPassword || process.env.DATABASE_PASSWORD || "",
    s3Bucket: config.s3Bucket || process.env.BACKUP_S3_BUCKET || "backups",
    s3Endpoint: config.s3Endpoint || process.env.S3_ENDPOINT || "",
    s3AccessKey: config.s3AccessKey || process.env.S3_ACCESS_KEY || "",
    s3SecretKey: config.s3SecretKey || process.env.S3_SECRET_KEY || "",
    retentionDays: config.retentionDays || 7,
  };

  const tempPath = `/tmp/restore-${Date.now()}.sql.gz`;

  try {
    // Download from S3
    const s3Client = new S3Client({
      endpoint: fullConfig.s3Endpoint,
      region: "us-east-1",
      credentials: {
        accessKeyId: fullConfig.s3AccessKey,
        secretAccessKey: fullConfig.s3SecretKey,
      },
      forcePathStyle: true,
    });

    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: fullConfig.s3Bucket,
        Key: backupKey,
      })
    );

    // Save to temp file
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    await execAsync(`cat > ${tempPath}`, { encoding: "buffer" });
    writeFileSync(tempPath, buffer);

    // Restore database
    const restoreCmd = `gunzip -c ${tempPath} | PGPASSWORD="${fullConfig.dbPassword}" psql \
      -h ${fullConfig.dbHost} \
      -p ${fullConfig.dbPort} \
      -U ${fullConfig.dbUser} \
      -d ${fullConfig.dbName}`;

    await execAsync(restoreCmd, { timeout: 600000 }); // 10 minute timeout

    // Cleanup
    await execAsync(`rm -f ${tempPath}`);

    logger.info("Database restore complete", { backupKey });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Database restore failed", { error: errorMessage, backupKey });
    
    // Cleanup
    await execAsync(`rm -f ${tempPath}`).catch(() => {
      // Ignore
    });

    return { success: false, error: errorMessage };
  }
}
