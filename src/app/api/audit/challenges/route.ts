import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { buildChallengesPrompt } from "@/lib/audit/prompts";
import { getFallbackChallenges } from "@/lib/audit/fallback";
import type { AuditAnswers } from "@/lib/audit/types";

export async function POST(req: Request) {
  let body: Partial<AuditAnswers>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "missing") {
      throw new Error("No API key");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: buildChallengesPrompt(body) }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 700,
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);

    if (!parsed.challenges || parsed.challenges.length < 4) {
      throw new Error("Invalid challenges response");
    }

    return NextResponse.json({
      challenges: parsed.challenges.slice(0, 8),
      fallback: false,
    });
  } catch (err) {
    console.error("[audit/challenges] error:", err);
    return NextResponse.json({
      challenges: getFallbackChallenges(body),
      fallback: true,
    });
  }
}
