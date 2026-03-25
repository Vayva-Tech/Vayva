import { Client } from "minio";

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
    const minioClient = new Client({
      endPoint: endpoint.replace(/^https?:\/\//, "").split("/")[0],
      port: parseInt(endpoint.split(":").pop() || "443"),
      useSSL: endpoint.startsWith("https"),
      accessKey: accessKeyId,
      secretKey: secretAccessKey,
      region,
    });

    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    await minioClient.putObject(bucket, key, body, {
      "Content-Type": file.type || "application/octet-stream",
    });

    return buildPublicUrl({ publicBaseUrl, endpoint, bucket, key });
  },
};
