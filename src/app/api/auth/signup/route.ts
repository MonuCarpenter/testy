import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose-connect";
import User from "@/models/User";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { name, email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  // Check duplicate
  const exists = await User.findOne({ email });
  if (exists) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const user = await User.create({
    name: name || "",
    email,
    password: hashed,
    role: "student",
    isActive: true,
    dateJoined: new Date(),
  });

  // Set session cookie for the new user
  await setSessionCookie(user);

  return NextResponse.json({
    id: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
  });
}
