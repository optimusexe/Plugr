type ResolveApiErrorOptions = {
  defaultStatus?: number;
  defaultMessage?: string;
};

export type ResolvedApiError = {
  status: number;
  message: string;
  code: string;
  requestId: string;
};

function sanitizeLogMessage(message: string): string {
  return message
    .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, "[redacted-ip]")
    .replace(/\b([a-zA-Z0-9.-]+):(\d{2,5})\b/g, "[redacted-host]:$2");
}

const INFRA_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENOTFOUND",
  "57P01",
  "53300",
]);

const SAFE_PUBLIC_MESSAGES = new Set([
  "Account already exists with this email.",
  "Invalid email or password.",
  "Account not verified.",
  "Verification code not available.",
  "Verification code has expired.",
  "Invalid verification code.",
  "Interaction not found.",
  "Interaction does not match provider/consumer.",
  "Only completed service interactions can be reviewed.",
  "This interaction has already been reviewed.",
]);

function getErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const maybeCode = (error as { code?: unknown }).code;
  if (typeof maybeCode === "string" && maybeCode.trim()) {
    return maybeCode.trim();
  }

  return null;
}

function getMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

export function resolveApiError(error: unknown, options: ResolveApiErrorOptions = {}): ResolvedApiError {
  const defaultStatus = options.defaultStatus ?? 500;
  const defaultMessage = options.defaultMessage ?? "Something went wrong. Please try again.";

  const requestId = `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const code = getErrorCode(error) ?? "UNKNOWN_ERROR";
  const message = getMessage(error);

  const hasInfraSignal =
    INFRA_ERROR_CODES.has(code) ||
    /ETIMEDOUT|ECONNREFUSED|ENOTFOUND|EHOSTUNREACH|connect\s+timeout|connection\s+terminated|database/i.test(message);

  if (hasInfraSignal) {
    return {
      status: 503,
      message: "Service is temporarily unavailable. Please try again shortly.",
      code: "SERVICE_UNAVAILABLE",
      requestId,
    };
  }

  if (SAFE_PUBLIC_MESSAGES.has(message)) {
    return {
      status: defaultStatus,
      message,
      code: "REQUEST_ERROR",
      requestId,
    };
  }

  return {
    status: defaultStatus,
    message: defaultMessage,
    code: "UNEXPECTED_ERROR",
    requestId,
  };
}

export function logApiError(scope: string, resolved: ResolvedApiError, error: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[${scope}] ${resolved.requestId}`, error);
    return;
  }

  const code = getErrorCode(error) ?? resolved.code;
  const message = sanitizeLogMessage(getMessage(error));
  const summary = message ? ` message=${message}` : "";
  console.error(
    `[${scope}] ${resolved.requestId} status=${resolved.status} code=${code}${summary}`,
  );
}
