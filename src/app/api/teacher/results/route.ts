import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose-connect";
import { getAuthOrThrow } from "@/lib/with-auth";
import Result from "@/models/Result";
import Test from "@/models/Test";
import User from "@/models/User";

export async function GET(req: Request) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const testId = searchParams.get("testId");

  // Get tests created by this teacher
  const query: any = { teacher: auth.user.id };
  if (testId) query._id = testId;

  const tests = await Test.find(query).select("_id title").lean();

  if (testId && tests.length === 0) {
    return NextResponse.json(
      { error: "Test not found or access denied" },
      { status: 403 }
    );
  }

  const testIds = tests.map((t) => t._id);

  // Get all results for these tests
  const results = await Result.find({
    test: { $in: testIds },
    testCompleted: true,
  })
    .populate("student", "name email studentId")
    .populate("test", "title subject totalQuestions")
    .select("student test totalQuestions correctAnswers percentage submittedAt")
    .sort({ submittedAt: -1 })
    .lean();

  return NextResponse.json({ results });
}
