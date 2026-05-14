import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

function isBase64(str: unknown): str is string {
  return typeof str === "string" && str.startsWith("data:");
}

function base64ToBuffer(dataUrl: string): { buffer: Buffer; contentType: string; ext: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid base64 data URL");
  const contentType = match[1];
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  return { buffer: Buffer.from(match[2], "base64"), contentType, ext };
}

// Walks through the payload and uploads all base64 images to R2, replacing with URLs
export async function processImagesInPayload(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>,
  prefix: string
): Promise<void> {
  if (isBase64(payload.fotoCapaPreview)) {
    const { buffer, contentType, ext } = base64ToBuffer(payload.fotoCapaPreview);
    payload.fotoCapaPreview = await uploadToR2(`${prefix}/capa.${ext}`, buffer, contentType);
  }

  if (isBase64(payload.fotoSobreCasal)) {
    const { buffer, contentType, ext } = base64ToBuffer(payload.fotoSobreCasal);
    payload.fotoSobreCasal = await uploadToR2(`${prefix}/sobre-casal.${ext}`, buffer, contentType);
  }

  if (Array.isArray(payload.episodios)) {
    for (const ep of payload.episodios) {
      if (isBase64(ep.capaPreview)) {
        const { buffer, contentType, ext } = base64ToBuffer(ep.capaPreview);
        ep.capaPreview = await uploadToR2(`${prefix}/ep-${ep.id}-capa.${ext}`, buffer, contentType);
      }
    }
  }

  if (Array.isArray(payload.momentos)) {
    for (const m of payload.momentos) {
      if (Array.isArray(m.fotos)) {
        for (const foto of m.fotos) {
          if (isBase64(foto.preview)) {
            const { buffer, contentType, ext } = base64ToBuffer(foto.preview);
            foto.preview = await uploadToR2(`${prefix}/m-${m.id}-${foto.id}.${ext}`, buffer, contentType);
          }
        }
      }
    }
  }
}
