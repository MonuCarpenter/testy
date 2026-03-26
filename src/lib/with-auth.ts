import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function getAuthOrThrow(required?: string | string[]) {
  const user = await getUserFromRequest();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }
  if (required) {
    const roles = Array.isArray(required) ? required : [required];
    if (!roles.includes(user.role)) {
      return {
        error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      } as const;
    }
  }
  return { user } as const;
}
