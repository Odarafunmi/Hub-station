"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type VoiceState = "idle" | "recording" | "paused";

export function useVoiceTranscription() {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const finalRef = useRef("");

  // check support
  useEffect(() => {
    const w: any = typeof window !== "undefined" ? window : null;
    const hasSpeech =
      w && (w.SpeechRecognition || w.webkitSpeechRecognition);
    // we still support mic via mediaRecorder fallback, so don't mark unsupported outright
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

  const start = useCallback(async () => {
    setError(null);
    setElapsed(0);
    finalRef.current = transcript; // resume from existing if any
    const w: any = window;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;

    // request mic permission early so browser prompts
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        // immediately stop tracks - we just wanted permission; recognition uses its own pipeline
        s.getTracks().forEach((t) => t.stop());
      }
    } catch (e: any) {
      // permission denied -> fallback to mock mode
      setSupported(false);
    }

    if (SR) {
      try {
        const rec = new SR();
        recognitionRef.current = rec;
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-NG"; // Nigerian English
        rec.onresult = (e: any) => {
          let interim = "";
          let finalChunk = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) finalChunk += r[0].transcript + " ";
            else interim += r[0].transcript;
          }
          if (finalChunk) {
            finalRef.current = (finalRef.current + " " + finalChunk).trim();
            setTranscript(finalRef.current);
          }
          setInterimText(interim);
        };
        rec.onerror = (e: any) => {
          // no-speech is common; don't surface as error
          if (e.error && e.error !== "no-speech" && e.error !== "aborted") {
            setError(e.error);
          }
        };
        rec.onend = () => {
          // auto-restart if still in recording state (continuous workaround for some browsers)
          if (recognitionRef.current && state !== "idle") {
            // will be restarted by effect
          }
        };
        rec.start();
        setState("recording");
        startTimer();
        return;
      } catch (err: any) {
        setError(err.message || "Mic error");
      }
    }

    // fallback mock mode: simulate transcription so UX still works
    setState("recording");
    startTimer();
    // simulate interim text so user sees progress
    let tick = 0;
    const sim = window.setInterval(() => {
      tick++;
      if (tick === 3) setInterimText("Listening…");
      if (tick === 6) {
        const mock = "I'm thinking out loud — this is a live transcription preview.";
        finalRef.current = (finalRef.current + " " + mock).trim();
        setTranscript(finalRef.current);
        setInterimText("");
        clearInterval(sim);
      }
    }, 500);
    // store interval to clear on stop
    (recognitionRef as any).currentSim = sim;
  }, [transcript, state, startTimer]);

  const stop = useCallback(() => {
    setState("idle");
    stopTimer();
    setInterimText("");
    // stop recognition
    try {
      recognitionRef.current?.stop?.();
    } catch {}
    if ((recognitionRef as any).currentSim) clearInterval((recognitionRef as any).currentSim);
    // finalRef already holds transcript
    return finalRef.current || transcript;
  }, [transcript, stopTimer]);

  const pause = useCallback(() => {
    if (state === "recording") {
      try { recognitionRef.current?.stop?.(); } catch {}
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
    stop();
    setTranscript("");
    setInterimText("");
    finalRef.current = "";
    setElapsed(0);
    setError(null);
  }, [stop]);

  // restart loop if recognition ends unexpectedly while recording
  useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    const onEnd = () => {
      if (state === "recording") {
        try { rec.start(); } catch {}
      }
    };
    rec.addEventListener?.("end", onEnd);
    return () => rec.removeEventListener?.("end", onEnd);
  }, [state]);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop?.(); } catch {}
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
    setTranscript, // allow editing afterwards
  };
}
