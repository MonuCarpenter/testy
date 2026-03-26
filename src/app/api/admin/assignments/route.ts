import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose-connect";
import { getAuthOrThrow } from "@/lib/with-auth";
import Test from "@/models/Test";

export async function GET(req: NextRequest) {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  // Recent assigned tests (any test with assignedStudents)
  const tests = await Test.find({
    assignedStudents: { $exists: true, $ne: [] },
  })
    .select(
      "title subject assignedStudents testDate startTime endTime updatedAt"
    )
    .sort({ updatedAt: -1 })
    .limit(20)
    .lean();
  return NextResponse.json(tests);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const {
    testId,
    studentId,
    testDate,
    startTime,
    endTime,
    durationMinutes,
    status,
  } = await req.json();
  if (!testId || !studentId || !testDate || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const update: any = {
    $addToSet: { assignedStudents: studentId },
    $set: {
      testDate: new Date(testDate),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      updatedAt: new Date(),
    },
  };
  if (typeof durationMinutes === "number")
    update.$set.durationMinutes = durationMinutes;
  if (status) update.$set.status = status;
  const doc = await Test.findByIdAndUpdate(testId, update, { new: true });
  return NextResponse.json({ ok: true, id: doc?._id });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { testId, updates } = await req.json();
  if (!testId)
    return NextResponse.json({ error: "testId required" }, { status: 400 });
  const doc = await Test.findByIdAndUpdate(
    testId,
    { $set: { ...updates, updatedAt: new Date() } },
    { new: true }
  );
  return NextResponse.json({ ok: true, id: doc?._id });
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { testId, studentId } = await req.json();
  if (!testId || !studentId)
    return NextResponse.json(
      { error: "testId and studentId required" },
      { status: 400 }
    );
  const doc = await Test.findByIdAndUpdate(
    testId,
    { $pull: { assignedStudents: studentId }, $set: { updatedAt: new Date() } },
    { new: true }
  );
  return NextResponse.json({ ok: true, id: doc?._id });
}
