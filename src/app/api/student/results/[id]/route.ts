import { NextRequest, NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import Result from "@/models/Result";
import Test from "@/models/Test";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthOrThrow("student");
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { id } = await ctx.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const res = await Result.findOne({ _id: id, student: auth.user.id }).lean();
  if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const test = await Test.findById(res.test)
    .select("title subject durationMinutes testDate startTime endTime")
    .lean();

  return NextResponse.json({ result: res, test });
}
