import { fileTypeFromBuffer } from "file-type";

/**
 * Sniff MIME type from bytes.
 * Reads the first 16KB to determine true file type.
 */
export async function sniffMimeType(buffer: Uint8Array | Buffer): Promise<string | undefined> {
  const result = await fileTypeFromBuffer(buffer);
  return result?.mime;
}

/**
 * Validates if a file (via its URL) matches its expected type.
 * Useful for finalizing signed uploads.
 */
export async function verifyFileMime(url: string, allowedMimeTypes: string[]): Promise<{ ok: boolean; detected?: string }> {
  try {
    const response = await fetch(url, {
      headers: { Range: "bytes=0-16383" },
    });

    if (!response.ok && response.status !== 206) {
      return { ok: false };
    }

    const buffer = await response.arrayBuffer();
    const detected = await sniffMimeType(new Uint8Array(buffer));

    if (!detected || !allowedMimeTypes.includes(detected)) {
      return { ok: false, detected };
    }

    return { ok: true, detected };
  } catch (error) {
    console.error("[FILE_SNIFF_ERROR]", error);
    return { ok: false };
  }
}
