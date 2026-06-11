import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { buildQuestionsPrompt } from "@/lib/audit/prompts";
import { getFallbackDynamicQuestions } from "@/lib/audit/fallback";
import type { AuditAnswers } from "@/lib/audit/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<AuditAnswers>;

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "missing") {
      return NextResponse.json({
        questions: getFallbackDynamicQuestions(body.industry ?? ""),
        fallback: true,
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: buildQuestionsPrompt(body) }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 600,
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);

    if (!parsed.questions || parsed.questions.length < 2) {
      throw new Error("Invalid response shape from OpenAI");
    }

    return NextResponse.json({ questions: parsed.questions, fallback: false });
  } catch (err) {
    console.error("[audit/questions] error:", err);
    const body = (await req.json().catch(() => ({}))) as Partial<AuditAnswers>;
    return NextResponse.json({
      questions: getFallbackDynamicQuestions(body.industry ?? ""),
      fallback: true,
    });
  }
}
