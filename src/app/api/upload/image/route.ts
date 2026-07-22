import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { uploadBufferToBlob } from "@/lib/azure/blob";
import { logApiError, resolveApiError } from "@/lib/api-error";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const CONTAINER_MAP: Record<string, string> = {
  profile: "plugr-profile-images",
  product: "plugr-product-images",
};

export async function POST(request: Request) {
  try {
    const userId = (await cookies()).get("plugr_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type") as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (!type || !CONTAINER_MAP[type]) {
      return NextResponse.json({ error: "type must be 'profile' or 'product'." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File must be an image (JPEG, PNG, WebP, or GIF)." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be less than 5MB." }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const blobName = `${userId}/${Date.now()}-${safeName}`;
    const containerName = CONTAINER_MAP[type];

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadBufferToBlob({
      blobName,
      buffer,
      contentType: file.type,
      containerName,
    });

    return NextResponse.json({ url: uploaded.url });
  } catch (error) {
    const resolved = resolveApiError(error, { defaultMessage: "Unable to upload image." });
    logApiError("api/upload/image", resolved, error);
    return NextResponse.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}
