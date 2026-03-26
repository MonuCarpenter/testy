import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface StudentContext {
  studentName: string;
  totalTests: number;
  completedTests: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  strongestSubject: string | null;
  weakestSubject: string | null;
  recentTests: Array<{
    title: string;
    subject: string;
    score: number;
    date: string;
    correctAnswers: number;
    totalQuestions: number;
  }>;
  subjectStats: Array<{
    subject: string;
    avgScore: number;
    tests: number;
  }>;
}

export function buildSystemPrompt(context: StudentContext): string {
  const trend =
    context.recentTests.length >= 2
      ? context.recentTests[0].score > context.recentTests[1].score
        ? "improving"
        : context.recentTests[0].score < context.recentTests[1].score
        ? "declining"
        : "stable"
      : "not enough data";

  return `You are an educational AI assistant helping a student named ${
    context.studentName
  } improve their test performance.

Student Profile:
- Total Tests Assigned: ${context.totalTests}
- Completed Tests: ${context.completedTests}
- Average Score: ${context.averageScore}%
- Highest Score: ${context.highestScore}%
- Lowest Score: ${context.lowestScore}%
- Strongest Subject: ${context.strongestSubject || "None yet"}
- Weakest Subject: ${context.weakestSubject || "None yet"}
- Recent Trend: ${trend}

Subject-wise Performance:
${context.subjectStats
  .map((s) => `- ${s.subject}: ${s.avgScore}% (${s.tests} tests)`)
  .join("\n")}

Recent Test Results:
${context.recentTests
  .slice(0, 5)
  .map(
    (t) =>
      `- ${t.title} (${t.subject}): ${t.score}% (${t.correctAnswers}/${
        t.totalQuestions
      }) on ${new Date(t.date).toLocaleDateString()}`
  )
  .join("\n")}

Your role:
1. Analyze their performance constructively and specifically
2. Identify improvement areas based on actual data
3. Provide personalized study recommendations
4. Explain concepts they might have struggled with
5. Encourage and motivate the student
6. Answer questions about their test performance
7. Suggest study strategies tailored to their weak subjects
8. Compare performance across subjects and time

Guidelines:
- Be friendly, supportive, and educational
- Use specific data from their tests when providing feedback
- Keep responses concise but informative (3-5 sentences unless detailed explanation is requested)
- If they ask about a specific test, focus on that test's performance
- Celebrate improvements and provide constructive feedback on areas needing work
- Don't make up data - only use what's provided in the context
- When discussing weak areas, always end with actionable advice

Remember: Your goal is to help ${
    context.studentName
  } improve their learning and test performance through personalized guidance.`;
}

export async function getChatResponse(
  context: StudentContext,
  userMessage: string,
  chatHistory: Array<{ role: "user" | "model"; parts: string }>,
  customSystemPrompt?: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = customSystemPrompt || buildSystemPrompt(context);
    const greeting = customSystemPrompt
      ? `Hello! I'm your AI teaching assistant. I've analyzed your class performance and I'm here to help you improve student outcomes. You can ask me about class performance, struggling students, test analysis, or teaching strategies. How can I assist you today?`
      : `Hello ${context.studentName}! I'm your AI study assistant. I've analyzed your test performance and I'm here to help you improve. You can ask me about your performance, get study tips, or discuss any specific tests you've taken. How can I help you today?`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: greeting }],
        },
        ...chatHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(
      error.message || "Failed to get AI response. Please try again."
    );
  }
}

export function getQuickActionPrompt(action: string): string {
  const prompts: Record<string, string> = {
    analyze_last:
      "Can you analyze my most recent test and tell me what I did well and where I need to improve?",
    study_tips:
      "What should I study next based on my performance? Give me a prioritized study plan.",
    weak_subjects:
      "I want to improve in my weakest subjects. What specific topics should I focus on?",
    compare_performance:
      "How has my performance changed over time? Am I improving or declining?",
    explain_mistakes:
      "Can you help me understand the types of mistakes I'm making in my tests?",
    motivation:
      "I need some motivation and study strategies to improve my scores.",
  };

  return prompts[action] || action;
}
