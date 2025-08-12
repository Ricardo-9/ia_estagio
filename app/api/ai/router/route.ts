import { NextRequest, NextResponse } from "next/server";
import { callLlama3API } from "@/lib/openrouterClient";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const reply = await callLlama3API([
      {
        role: "system",
        content: "Você é um coach pessoal que ajuda o usuário a manter o foco nas metas de saúde, produtividade e aprendizado."
      },
      {
        role: "user",
        content: message
      }
    ]);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro na IA" }, { status: 500 });
  }
}
