"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";

export default function IDVerificationPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image");
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file upload
  const handleUpload = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError("Please select an ID image to upload");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("action", "upload-id");
      formData.append("document", selectedFile);
      formData.append("documentName", selectedFile.name);

      const response = await fetch("/api/verification", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to upload document");
        return;
      }

      setSuccess("✓ ID document uploaded successfully!");
      setTimeout(() => {
        router.push("/verification");
      }, 1500);
    } catch (err) {
      setError("Error processing file. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, router]);

  return (
    <main className="page-shell px-5 pb-8 sm:px-8 lg:px-16">
      <AppHeader />
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="rounded-2xl border border-black/10 bg-[var(--card)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Verification
          </p>
          <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold">Upload Student ID</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Verify your status as a LASU student</p>
        </header>

        <div className="rounded-2xl border border-black/10 bg-[var(--card)] p-6">
          <Link
            href="/verification"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            ← Back to Verification
          </Link>

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-900">What to upload:</h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>✓ Clear photo of your LASU student ID card</li>
                <li>✓ Must be a JPG, PNG, or WebP image</li>
                <li>✓ Maximum file size: 5MB</li>
                <li>✓ Ensure ID details are clearly visible</li>
              </ul>
            </div>

            <div>
              <label htmlFor="file-upload" className="mb-3 block text-sm font-semibold text-[var(--ink)]">
                Select ID Image
              </label>

              {!preview ? (
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/10 bg-[var(--card)] px-6 py-12 transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
                >
                  <div className="mb-3 text-4xl">📸</div>
                  <p className="font-semibold text-[var(--ink)]">Click to upload or drag & drop</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">JPG, PNG or WebP (max 5MB)</p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border border-black/10 bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="ID Preview" className="h-64 w-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      setError("");
                    }}
                    className="w-full rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-black/5"
                  >
                    Change Image
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full rounded-xl bg-[var(--accent)] px-6 py-3 font-semibold text-white transition-all hover:bg-[var(--accent)]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload ID"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-black/5 bg-[var(--card)] p-4">
            <p className="text-xs text-[var(--muted)]">
              🔒 Your ID document is securely stored and only used for verification purposes. We will never share your personal information.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
