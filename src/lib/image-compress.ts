export async function compressImageFile(
  file: File,
  options: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  const maxDimension = options.maxDimension ?? 900;
  const quality = options.quality ?? 0.8;

  if (file.size <= 300 * 1024) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let targetWidth = width;
  let targetHeight = height;
  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    targetWidth = Math.round(width * ratio);
    targetHeight = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, quality);
  });

  if (!blob) {
    return file;
  }

  const name = file.name.replace(/\.[^/.]+$/, "") + (outputType === "image/png" ? ".png" : ".jpg");
  return new File([blob], name, { type: blob.type });
}

export async function uploadCompressedImage(file: File, type: "profile" | "product"): Promise<string> {
  const compressed = await compressImageFile(file);
  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("type", type);

  const response = await fetch("/api/upload/image", { method: "POST", body: formData });
  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error || "Failed to upload image.");
  }

  return data.url;
}
