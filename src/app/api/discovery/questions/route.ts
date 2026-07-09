import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { buildDiscoveryQuestionsPrompt } from "@/lib/discovery/prompts";
import { getFallbackDiscoveryQuestions } from "@/lib/discovery/fallback";
import { discoveryIntakePartialSchema } from "@/lib/discovery/schema";
import { discoveryIpLimit, discoverySessionAiLimit } from "@/lib/discovery/rate-limit";

const bodySchema = z.object({
  sessionId: z.string().min(8),
  answers: discoveryIntakePartialSchema,
});

export async function POST(req: Request) {
  const ipLimit = discoveryIpLimit(req);
  if (!ipLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let sessionId: string;
  let answers: z.infer<typeof discoveryIntakePartialSchema>;

  try {
    const body = await req.json();
    const parsed = bodySchema.parse(body);
    sessionId = parsed.sessionId;
    answers = parsed.answers;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const aiLimit = discoverySessionAiLimit(sessionId);
  if (!aiLimit.success) {
    return NextResponse.json({ error: "AI limit reached for this session" }, { status: 429 });
  }

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "missing") {
      return NextResponse.json({
        questions: getFallbackDiscoveryQuestions(),
        fallback: true,
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: buildDiscoveryQuestionsPrompt(answers) }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 900,
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text) as { questions?: unknown[] };

    if (!parsed.questions || parsed.questions.length < 2) {
      throw new Error("Invalid response shape from OpenAI");
    }

    const questions = parsed.questions.slice(0, 3);
    return NextResponse.json({ questions, fallback: false });
  } catch (err) {
    console.error("[discovery/questions] error:", err);
    return NextResponse.json({
      questions: getFallbackDiscoveryQuestions(),
      fallback: true,
    });
  }
}
