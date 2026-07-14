import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { BlobServiceClient } from "@azure/storage-blob";
import { getAzureStorageConnectionString } from "@/lib/azure/config";

export async function GET(request: Request) {
  try {
    const adminUser = await getCurrentAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const blobName = url.searchParams.get("blobName");
    const containerName = url.searchParams.get("containerName") || "verification-documents";

    if (!blobName) {
      return NextResponse.json({ error: "blobName is required" }, { status: 400 });
    }

    const connectionString = getAzureStorageConnectionString();
    if (!connectionString) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    // Download the blob data
    const downloadBlockBlobResponse = await blobClient.download();
    const chunks: Buffer[] = [];

    for await (const chunk of downloadBlockBlobResponse.readableStreamBody!) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    }

    const buffer = Buffer.concat(chunks);

    // Determine content type
    let contentType = "application/octet-stream";
    if (blobName.endsWith(".png")) contentType = "image/png";
    else if (blobName.endsWith(".jpg") || blobName.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (blobName.endsWith(".webp")) contentType = "image/webp";
    else if (blobName.endsWith(".pdf")) contentType = "application/pdf";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching verification document:", error);
    return NextResponse.json({ error: "Unable to fetch document" }, { status: 500 });
  }
}
