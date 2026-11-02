import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(req: NextRequest){
  const { channel, prompt, profile } = await req.json().catch(()=> ({}));
  // In production, this route assembles: system prompt + voice profile + task + source material, calls Claude, stores draft
  const templates: Record<string,string> = {
    linkedin: "A quiet lesson from last week:\n\nScope was vague. Next step was missing. Price arrived before value. When we fixed the first two, the third stopped being a problem.",
    blog: "# Why quiet proposals are not about price\n\nThree things show up whenever a project goes silent...",
    instagram: "Carousel: 3 reasons clients go quiet (and fixes) · slide by slide outline",
  };
  const body = templates[channel] || "Generated draft for "+channel;
  return NextResponse.json({ channel, body, status:"draft", note: "API keys never reach the browser — all AI calls run here." });
}
