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
  await containerClient.createIfNotExists();

  const blobClient = containerClient.getBlockBlobClient(input.blobName);
  await blobClient.uploadData(input.buffer, {
    blobHTTPHeaders: input.contentType ? { blobContentType: input.contentType } : undefined,
  });

  return {
    blobName: input.blobName,
    url: blobClient.url,
  };
}