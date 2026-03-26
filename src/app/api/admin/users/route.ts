import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongoose-connect";
import { getAuthOrThrow } from "@/lib/with-auth";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const role = req.nextUrl.searchParams.get("role");
  const cond = role ? { role } : {};
  const users = await User.find(cond).lean();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const body = await req.json();
  const { name, email, role, password } = body;

  // Hash the password before saving
  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    role,
    password: hashedPassword,
  });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { id, ...fields } = await req.json();
  const user = await User.findByIdAndUpdate(id, fields, { new: true });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { id } = await req.json();
  const user = await User.findByIdAndDelete(id);
  return NextResponse.json({ success: !!user });
}
