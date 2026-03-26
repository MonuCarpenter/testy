import { NextRequest, NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import Result from "@/models/Result";
import Question from "@/models/Question";
import Test from "@/models/Test";
import { decryptString } from "@/lib/encryption";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ resultId: string }> }
) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { resultId } = await ctx.params;

  // Get the result and populate student and test info
  const result = await Result.findById(resultId)
    .populate("student", "name email studentId")
    .populate("test", "title subject teacher")
    .lean();

  if (!result) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  // Verify teacher has access to this result
  const test = result.test as any;
  if (
    auth.user.role !== "admin" &&
    auth.user.role !== "superadmin" &&
    String(test.teacher) !== auth.user.id
  ) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Get all questions for this test
  const questionDoc = await Question.findOne({ testId: test._id }).lean();
  if (!questionDoc) {
    return NextResponse.json({ error: "Questions not found" }, { status: 404 });
  }

  // Decrypt questions and match with student's answers
  const questions = (questionDoc as any).questions || [];
  const studentAnswers = (result.answers as any[]) || [];

  const reviewData = questions.map((q: any) => {
    const studentAnswer = studentAnswers.find(
      (a) => a.questionNumber === q.questionNumber
    );

    return {
      questionNumber: q.questionNumber,
      question: decryptString(q.encryptedQuestion),
      options: q.encryptedOptions.map((opt: string) => decryptString(opt)),
      correctAnswerIndex: q.correctAnswerIndex,
      studentAnswerIndex: studentAnswer?.chosenOption ?? null,
      isCorrect: studentAnswer?.isCorrect ?? false,
      explanation: q.explanation || null,
    };
  });

  return NextResponse.json({
    student: result.student,
    test: {
      _id: test._id,
      title: test.title,
      subject: test.subject,
    },
    totalQuestions: result.totalQuestions,
    correctAnswers: result.correctAnswers,
    percentage: result.percentage,
    submittedAt: result.submittedAt,
    questions: reviewData,
  });
}
