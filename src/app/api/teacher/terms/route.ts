import { NextRequest, NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import TermsTemplate from "@/models/TermsTemplate";

// GET - Fetch teacher's terms template
export async function GET() {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();

    // Find the teacher's terms template
    let template = await TermsTemplate.findOne({
      teacher: auth.user.id,
    }).lean();

    // If no template exists, return empty terms
    if (!template) {
      return NextResponse.json({
        terms: [""],
      });
    }

    return NextResponse.json({
      terms: template.terms.length > 0 ? template.terms : [""],
    });
  } catch (error: any) {
    console.error("Get terms error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch terms" },
      { status: 500 }
    );
  }
}

// POST - Create or update teacher's terms template
export async function POST(req: NextRequest) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();
    const { terms } = await req.json();

    // Validate terms
    if (!Array.isArray(terms)) {
      return NextResponse.json(
        { error: "Terms must be an array" },
        { status: 400 }
      );
    }

    if (terms.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 terms allowed" },
        { status: 400 }
      );
    }

    // Filter out empty terms
    const filteredTerms = terms.filter((t: string) => t.trim().length > 0);

    // Find existing template or create new one
    let template = await TermsTemplate.findOne({ teacher: auth.user.id });

    if (template) {
      // Update existing template
      template.terms = filteredTerms;
      template.updatedAt = new Date();
      await template.save();
    } else {
      // Create new template
      template = await TermsTemplate.create({
        teacher: auth.user.id,
        terms: filteredTerms,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Terms saved successfully",
      terms: template.terms,
    });
  } catch (error: any) {
    console.error("Save terms error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save terms" },
      { status: 500 }
    );
  }
}
