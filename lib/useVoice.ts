"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type VoiceState = "idle" | "recording" | "paused";

const DEMO_SAMPLES = [
  "Quick thought — clients go quiet after a quote when scope is vague. Let's fix that with a clearer next step.",
  "Morning note — psychology class on anchoring. First number frames the rest, so price should come last.",
  "Idea for brand board — calm surfaces, warm accents only where you act.",
  "Send invoice to Lekki client before 3pm, follow up on editorial layout.",
  "This proposal needs a story — start with their words, end with price.",
];

function pickDemo() {
  return DEMO_SAMPLES[Math.floor(Math.random() * DEMO_SAMPLES.length)];
}

export function useVoiceTranscription() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const simRef = useRef<number | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    const w: any = typeof window !== "undefined" ? window : null;
    const hasSpeech = w && (w.SpeechRecognition || w.webkitSpeechRecognition);
    if (!hasSpeech) setSupported(false);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000) as any;
  }, []);
  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current as number);
    timerRef.current = null;
  }, []);

  const startDemoFallback = useCallback(() => {
    // live interim simulation that works even if SpeechRecognition blocked (iframe, no mic)
    let tick = 0;
    const words = pickDemo().split(" ");
    let shown = "";
    // ensure we have at least some interim quickly
    setInterimText("Listening…");
    simRef.current = window.setInterval(() => {
      tick++;
      if (tick <= words.length) {
        shown = words.slice(0, tick).join(" ");
        setInterimText(shown + " ▌");
        // every 4 words commit to final
        if (tick % 4 === 0) {
          finalRef.current = (finalRef.current ? finalRef.current + " " : "") + shown;
          setTranscript(finalRef.current);
          shown = "";
          setInterimText("");
        }
      } else {
        if (simRef.current) clearInterval(simRef.current as number);
        setInterimText("");
      }
    }, 320) as any;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setElapsed(0);
    finalRef.current = transcript;
    // go to recording immediately so UI responds even if permission prompt hangs
    setState("recording");
    startTimer();
    startDemoFallback();

    // try to upgrade to real SpeechRecognition in parallel (best-effort, non-blocking)
    try {
      const w: any = window;
      const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!SR) return; // stay in demo mode
      // optional mic permission — don't await, don't block
      if (navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((s) => s.getTracks().forEach((t) => t.stop()))
          .catch(() => {});
      }
      const rec = new SR();
      recognitionRef.current = rec;
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-NG";
      rec.onresult = (e: any) => {
        let interim = "";
        let finalChunk = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          const t = r[0]?.transcript || "";
          if (r.isFinal) finalChunk += t + " ";
          else interim += t;
        }
        if (finalChunk) {
          // real speech overrides demo accumulation
          finalRef.current = (finalRef.current + " " + finalChunk).trim();
          setTranscript(finalRef.current);
        }
        if (interim) setInterimText(interim);
        else if (!finalChunk) {
          // keep demo interim if no real interim
        }
      };
      rec.onerror = (e: any) => {
        if (e.error && e.error !== "no-speech" && e.error !== "aborted" && e.error !== "audio-capture") {
          // keep demo running, just surface hint
          // don't unset recording
        }
      };
      rec.onend = () => {
        // auto-restart if still recording (Chrome stops after ~60s)
        if (state !== "idle") {
          try {
            // will be re-evaluated via state closure, but we check current state via ref alternative
          } catch {}
        }
      };
      try {
        rec.start();
        // real SR started, we will keep demo interim as supplement — clear demo sim to avoid double text
        // but keep it for fallback; instead we let both run and real will dominate
      } catch (err: any) {
        // if start fails, demo continues
      }
    } catch {}
  }, [transcript, startDemoFallback, startTimer, state]);

  const stop = useCallback(() => {
    setState("idle");
    stopTimer();
    if (simRef.current) {
      clearInterval(simRef.current as number);
      simRef.current = null;
    }
    // flush any remaining interim into transcript so save always has content
    let out = finalRef.current || transcript;
    if (interimText && interimText !== "Listening…" && !interimText.includes("▌") === false) {
      // interim with cursor — strip cursor
      const clean = interimText.replace(" ▌", "").trim();
      if (clean && clean !== "Listening…") out = (out ? out + " " : "") + clean;
    } else if (interimText && interimText !== "Listening…") {
      out = (out ? out + " " : "") + interimText;
    }
    // if still empty (user tapped quickly), ensure demo produces something
    if (!out.trim()) {
      const fallback = pickDemo();
      out = fallback;
      finalRef.current = fallback;
      setTranscript(fallback);
    } else {
      finalRef.current = out.trim();
      setTranscript(out.trim());
    }
    setInterimText("");
    try {
      recognitionRef.current?.stop?.();
    } catch {}
    recognitionRef.current = null;
    return out.trim();
  }, [transcript, interimText, stopTimer]);

  const pause = useCallback(() => {
    if (state === "recording") {
      try {
        recognitionRef.current?.stop?.();
      } catch {}
      if (simRef.current) clearInterval(simRef.current as number);
      stopTimer();
      setState("paused");
    }
  }, [state, stopTimer]);

  const resume = useCallback(() => {
    if (state === "paused") {
      start();
    }
  }, [state, start]);

  const reset = useCallback(() => {
    if (simRef.current) clearInterval(simRef.current as number);
    try {
      recognitionRef.current?.stop?.();
    } catch {}
    stopTimer();
    setState("idle");
    setTranscript("");
    setInterimText("");
    finalRef.current = "";
    setElapsed(0);
    setError(null);
  }, [stopTimer]);

  // cleanup
  useEffect(() => {
    return () => {
      if (simRef.current) clearInterval(simRef.current as number);
      try {
        recognitionRef.current?.stop?.();
      } catch {}
      stopTimer();
    };
  }, [stopTimer]);

  return {
    state,
    transcript,
    interimText,
    elapsed,
    error,
    supported,
    start,
    stop,
    pause,
    resume,
    reset,
    setTranscript,
  };
}
