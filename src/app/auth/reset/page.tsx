import React, { Suspense } from "react";
import AuthResetClient from "@/components/auth-reset-client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div />}> 
      <AuthResetClient />
    </Suspense>
  );
}
