import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getS3Config() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET;
  const region = process.env.MINIO_REGION || "us-east-1";
  const publicBaseUrl = process.env.MINIO_PUBLIC_BASE_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Missing MinIO configuration (MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET)",
    );
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
    region,
    publicBaseUrl,
  };
}

function buildPublicUrl(params: {
  publicBaseUrl?: string;
  endpoint: string;
  bucket: string;
  key: string;
}) {
  const { publicBaseUrl, endpoint, bucket, key } = params;
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  }
  const base = endpoint.replace(/\/$/, "");
  return `${base}/${bucket}/${key}`;
}

interface StorageContext {
  userId: string;
  merchantId: string;
  storeId: string;
  roles: string[];
}

export const StorageService = {
  async upload(
    ctx: StorageContext,
    filename: string,
    file: Blob,
  ): Promise<string> {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `stores/${ctx.storeId}/${Date.now()}-${safeName}`;

    const {
      endpoint,
      accessKeyId,
      secretAccessKey,
      bucket,
      region,
      publicBaseUrl,
    } = getS3Config();
    const s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });

    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: file.type || "application/octet-stream",
        ACL: "public-read",
      }),
    );

    return buildPublicUrl({ publicBaseUrl, endpoint, bucket, key });
  },
};
