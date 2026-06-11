import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set — audit AI features will use fallback mode.");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "missing",
});
