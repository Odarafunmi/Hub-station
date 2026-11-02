import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(req: NextRequest){
  // Simulate server-side transcription: in real app, we'd call Whisper/Deepgram with API key kept on server
  const body = await req.json().catch(()=> ({}));
  const samples = [
    "So I was thinking about why clients go quiet after a quote — it's usually unclear scope, no next step, and price before value.",
    "Morning voice note: psychology class on cognitive bias yesterday — anchoring explains why the first number sticks.",
    "Quick task: send invoice to the Lekki client before 3pm.",
  ];
  const text = samples[Math.floor(Math.random()*samples.length)];
  // simulate 800ms delay
  await new Promise(r=> setTimeout(r, 800));
  return NextResponse.json({ text, status: "done", savedTo: "private bucket `audio`" });
}
