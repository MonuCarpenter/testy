import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose-connect";
import { getAuthOrThrow } from "@/lib/with-auth";
import Result from "@/models/Result";
import Test from "@/models/Test";

export async function GET() {
  const auth = await getAuthOrThrow(["teacher", "admin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const tests = await Test.find({ teacher: (auth as any).user.id })
    .select("_id")
    .lean();
  const ids = (tests as any[]).map((t: any) => t._id);
  const results = await (Result as any)
    .find({ test: { $in: ids } })
    .populate("student", "name")
    .lean();
  return NextResponse.json({ results });
}
