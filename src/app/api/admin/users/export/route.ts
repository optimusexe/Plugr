import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { getUsers } from "@/lib/auth-store";
import { getProfiles } from "@/lib/profile-store";
import * as XLSX from "xlsx";

function escapeCsv(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(request: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "email";
  const users = await getUsers();

  if (format === "full") {
    const headers = [
      "id",
      "full_name",
      "email",
      "password_hash",
      "verified",
      "is_admin",
      "verification_code",
      "verification_code_expires_at",
      "created_at",
      "updated_at",
    ];

    const rows = users.map((user) => [
      user.id,
      user.fullName,
      user.email,
      user.passwordHash,
      user.verified,
      user.isAdmin,
      user.verificationCode ?? "",
      user.verificationCodeExpiresAt ?? "",
      user.createdAt,
      user.updatedAt,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="plugr-users-full.csv"`,
      },
    });
  }

  if (format === "spreadsheet") {
    const profiles = await getProfiles();
    const profilesByUserId = new Map(profiles.map((p) => [p.userId, p]));

    const data = users.map((user) => {
      const profile = profilesByUserId.get(user.id);
      return {
        "User": user.fullName,
        "Email": user.email,
        "Phone": profile?.phone ?? "",
        "Verified Badge": profile?.verificationStatus === "verified" ? "Yes" : "No",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="plugr-users.xlsx"`,
      },
    });
  }

  const csv = ["email", ...users.map((user) => escapeCsv(user.email))].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="plugr-user-emails.csv"`,
    },
  });
}