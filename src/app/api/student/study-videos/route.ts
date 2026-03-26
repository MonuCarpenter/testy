import { NextRequest, NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import Test from "@/models/Test";
import Result from "@/models/Result";
import { getStudyVideosForSubject } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  const auth = await getAuthOrThrow(["student"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");

    if (!subject) {
      return NextResponse.json(
        { error: "Subject parameter is required" },
        { status: 400 }
      );
    }

    const studentId = auth.user.id;

    // Get all tests assigned to this student for the specified subject
    const assignedTests = await Test.find({
      assignedStudents: studentId,
      subject: subject,
    })
      .select("_id")
      .lean();

    const testIds = assignedTests.map((t) => t._id);

    // Get results for this subject
    const results = await Result.find({
      student: studentId,
      test: { $in: testIds },
      testCompleted: true,
    }).lean();

    // Calculate average score for the subject
    const avgScore =
      results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + r.percentage, 0) / results.length
          )
        : 0;

    // Fetch YouTube videos
    const videos = await getStudyVideosForSubject(subject);

    return NextResponse.json({
      subject,
      avgScore,
      testsCompleted: results.length,
      videos,
      suggestion:
        avgScore < 75
          ? `Your ${subject} average is ${avgScore}%. These videos can help you improve!`
          : `Great job in ${subject} (${avgScore}%)! These videos can help you excel further.`,
    });
  } catch (error: any) {
    console.error("YouTube API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch study videos",
      },
      { status: 500 }
    );
  }
}
