import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose-connect";
import Test from "@/models/Test";
import { getAuthOrThrow } from "@/lib/with-auth";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ testId: string }> }
) {
  try {
    // Get student from auth
    const auth = await getAuthOrThrow("student");
    if ("error" in auth) return auth.error;

    await dbConnect();
    const { testId } = await ctx.params;

    // Find the test
    const test = await Test.findById(testId)
      .select("title termsAndConditions assignedStudents")
      .lean();

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Check if student is assigned to this test
    const isAssigned = (test as any).assignedStudents?.some(
      (s: any) => s.toString() === auth.user.id.toString()
    );
    if (!isAssigned) {
      return NextResponse.json(
        { error: "Not authorized for this test" },
        { status: 403 }
      );
    }

    // Return terms if they exist
    return NextResponse.json({
      testTitle: (test as any).title,
      terms: (test as any).termsAndConditions || [],
    });
  } catch (err: any) {
    console.error("Error fetching test terms:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch terms" },
      { status: 500 }
    );
  }
}
