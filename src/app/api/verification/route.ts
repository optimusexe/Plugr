import { cookies } from "next/headers";
import {
  completeVerificationCheck,
  getOrCreateVerificationChecks,
  getVerificationProgress,
  resetVerificationCheck,
  sendEmailOTP,
  setIDDocument,
  verifyEmailOTP,
} from "@/lib/verification-store";
import { uploadBufferToBlob } from "@/lib/azure/blob";
import { logApiError, resolveApiError } from "@/lib/api-error";
import { VerificationCheckType } from "@/lib/types";

function isValidSchoolEmail(value: string): boolean {
  return value.toLowerCase().endsWith("@st.lasu.edu.ng");
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("plugr_user_id")?.value;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateVerificationChecks(userId);
    const progress = await getVerificationProgress(userId);
    return Response.json(progress);
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultStatus: 500,
      defaultMessage: "Unable to load verification status.",
    });
    logApiError("api/verification/GET", resolved, error);
    return Response.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}

type VerificationActionBody = {
  action?:
    | "send-email-otp"
    | "verify-email-otp"
    | "upload-id";
  emailAddress?: string;
  phoneNumber?: string;
  otp?: string;
  documentUrl?: string;
  documentName?: string;
  checkType?: VerificationCheckType;
  completed?: boolean;
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("plugr_user_id")?.value;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateVerificationChecks(userId);
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const action = String(formData.get("action") ?? "");

      if (action === "upload-id") {
        const fileEntry = formData.get("document");

        if (!(fileEntry instanceof File)) {
          return Response.json({ message: "ID document is required" }, { status: 400 });
        }

        const documentName = fileEntry.name || String(formData.get("documentName") ?? "student-id");
        const safeName = documentName.replace(/[^a-zA-Z0-9._-]/g, "-");
        const blobName = `${userId}/verification/${Date.now()}-${safeName}`;
        const uploaded = await uploadBufferToBlob({
          blobName,
          buffer: Buffer.from(await fileEntry.arrayBuffer()),
          contentType: fileEntry.type || "application/octet-stream",
          containerName: "verification-documents",
        });

        const check = await setIDDocument(userId, uploaded.url, documentName);
        if (!check) {
          return Response.json({ message: "Unable to save ID document" }, { status: 404 });
        }

        return Response.json({ ok: true, message: "ID uploaded successfully", documentUrl: uploaded.url });
      }

      return Response.json({ message: "Unsupported multipart action" }, { status: 400 });
    }

    const body = (await request.json()) as VerificationActionBody;

    if (body.action === "send-email-otp") {
      const email = (body.emailAddress || "").trim().toLowerCase();
      if (!email || !isValidSchoolEmail(email)) {
        return Response.json(
          { message: "Please enter a valid LASU student email ending with @st.lasu.edu.ng" },
          { status: 400 }
        );
      }

      const check = await sendEmailOTP(userId, email);
      if (!check) {
        return Response.json({ message: "Unable to start email verification" }, { status: 404 });
      }

      return Response.json({ ok: true, message: "Verification code sent to your email" });
    }

    if (body.action === "verify-email-otp") {
      const otp = (body.otp || "").trim();
      if (!/^\d{6}$/.test(otp)) {
        return Response.json({ message: "Enter a valid 6-digit code" }, { status: 400 });
      }

      const result = await verifyEmailOTP(userId, otp);
      if (!result.success) {
        return Response.json({ message: result.message }, { status: 400 });
      }

      await completeVerificationCheck(userId, "email_verified");

      return Response.json({ ok: true, message: result.message });
    }

    if (body.checkType && typeof body.completed === "boolean") {
      const check = body.completed
        ? await completeVerificationCheck(userId, body.checkType)
        : await resetVerificationCheck(userId, body.checkType);

      if (!check) {
        return Response.json({ message: "Verification check not found" }, { status: 404 });
      }

      return Response.json({ ok: true, check });
    }

    return Response.json(
      { message: "Invalid request. Provide a supported action or check update payload." },
      { status: 400 }
    );
  } catch (error) {
    const resolved = resolveApiError(error, {
      defaultStatus: 500,
      defaultMessage: "Unable to update verification right now.",
    });
    logApiError("api/verification/POST", resolved, error);
    return Response.json(
      { error: resolved.message, code: resolved.code, requestId: resolved.requestId },
      { status: resolved.status },
    );
  }
}