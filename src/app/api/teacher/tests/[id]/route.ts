import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose-connect";
import { getAuthOrThrow } from "@/lib/with-auth";
import Test from "@/models/Test";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const cond: any = { _id: id };
  if (auth.user.role === "teacher") cond.teacher = auth.user.id;
  const doc = await Test.findOneAndUpdate(cond, body, { new: true });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { id } = await params;
  const cond: any = { _id: id };
  if (auth.user.role === "teacher") cond.teacher = auth.user.id;
  const doc = await Test.findOneAndDelete(cond);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
