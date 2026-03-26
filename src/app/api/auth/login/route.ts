import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose-connect";
import User from "@/models/User";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();
  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await verifyPassword(password, user.password);
  if (!ok)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  await setSessionCookie(user);
  return NextResponse.json({
    id: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
  });
}
