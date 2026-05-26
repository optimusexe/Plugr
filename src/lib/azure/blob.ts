import { BlobServiceClient } from "@azure/storage-blob";
import { getAzureStorageConnectionString, getAzureStorageContainer } from "./config";

let blobServiceClient: BlobServiceClient | null = null;

function getBlobServiceClient(): BlobServiceClient {
  if (blobServiceClient) {
    return blobServiceClient;
  }

  const connectionString = getAzureStorageConnectionString();
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is required for Blob storage.");
  }

  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient;
}

export async function uploadBufferToBlob(input: {
  blobName: string;
  buffer: Buffer;
  contentType?: string;
  containerName?: string;
}): Promise<{ blobName: string; url: string }> {
  const serviceClient = getBlobServiceClient();
  const containerName = input.containerName ?? getAzureStorageContainer();
  const containerClient = serviceClient.getContainerClient(containerName);
  try {
    await containerClient.createIfNotExists();
  } catch (err) {
    // If the credential used doesn't allow creating containers (e.g., a SAS token without 'c' permission),
    // allow uploads to proceed if the container already exists. Log a warning for visibility.
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = (err as any)?.statusCode ?? (err as any)?.status ?? undefined;
      console.warn(`Blob container createIfNotExists failed (status=${code}). Continuing assuming container exists.`);
    } catch {
      console.warn("Blob container createIfNotExists failed. Continuing assuming container exists.");
    }
  }

  const blobClient = containerClient.getBlockBlobClient(input.blobName);
  await blobClient.uploadData(input.buffer, {
    blobHTTPHeaders: input.contentType ? { blobContentType: input.contentType } : undefined,
  });

  return {
    blobName: input.blobName,
    url: blobClient.url,
  };
}