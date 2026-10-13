import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ connected: false, reason: "GROQ_API_KEY no configurada" }, { status: 200 });
  }

  try {
    const groq = new Groq({ apiKey });
    await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [{ role: "user", content: "Responde ok" }],
      max_tokens: 5,
      temperature: 0.2,
    });

    return NextResponse.json({ connected: true }, { status: 200 });
  } catch (error) {
    console.error("Health check Groq failed:", error);
    return NextResponse.json(
      { connected: false, reason: "No se pudo conectar con Groq" },
      { status: 200 }
    );
  }
}
