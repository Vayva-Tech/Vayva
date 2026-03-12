import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { chromium } from "playwright";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getS3Config() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET;
  const region = process.env.MINIO_REGION || "us-east-1";
  const publicBaseUrl = process.env.MINIO_PUBLIC_BASE_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Missing MinIO configuration (MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET)");
  }

  return { endpoint, accessKeyId, secretAccessKey, bucket, region, publicBaseUrl };
}

function buildPublicUrl(params: { publicBaseUrl?: string; endpoint: string; bucket: string; key: string }) {
  const { publicBaseUrl, endpoint, bucket, key } = params;
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }
  const base = endpoint.replace(/\/$/, "");
  return `${base}/${bucket}/${key}`;
}

export async function generateThumbnail(data: {
  storeId: string;
  deploymentId?: string;
  templateProjectId?: string;
  url: string;
}) {
  const { storeId, deploymentId, templateProjectId, url } = data;

  logger.info("Starting thumbnail generation", { storeId, url, deploymentId, templateProjectId });

  let browser;
  try {
    browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    
    // Set viewport for a nice thumbnail aspect ratio
    await page.setViewportSize({ width: 1280, height: 720 });

    // Navigate to the site
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Take screenshot
    const buffer = await page.screenshot({
      type: "jpeg",
      quality: 80,
    });

    const { endpoint, accessKeyId, secretAccessKey, bucket, region, publicBaseUrl } = getS3Config();
    const s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });

    const key = `thumbnails/${storeId}/${deploymentId || templateProjectId || "latest"}-${Date.now()}.jpg`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
        ACL: "public-read",
      }),
    );

    const thumbnailUrl = buildPublicUrl({ publicBaseUrl, endpoint, bucket, key });

    // Update the record
    if (deploymentId) {
      await prisma.storeDeployment.update({
        where: { id: deploymentId },
        data: { thumbnailUrl },
      });
    }

    if (templateProjectId) {
      await prisma.templateProject.update({
        where: { id: templateProjectId },
        data: { thumbnailUrl },
      });
    }

    // Also update store's general thumbnail if this is the latest deployment
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { currentDeploymentId: true },
    });

    if (store?.currentDeploymentId === deploymentId) {
      // In a real app, we might want a separate thumbnail field on Store, 
      // but for now we often just pull it from the current deployment.
      // If we added it to Store model:
      // await prisma.store.update({ where: { id: storeId }, data: { thumbnailUrl } });
    }

    logger.info("Thumbnail generation successful", { storeId, thumbnailUrl });
    return { thumbnailUrl };
  } catch (error: any) {
    logger.error("Thumbnail generation failed", {
      storeId,
      url,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
