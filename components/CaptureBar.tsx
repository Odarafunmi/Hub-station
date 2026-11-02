"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, Pause, Square, Send, AudioLines, X, Tag, FileCode } from "lucide-react";
import { useStore } from "@/lib/store";

export default function CaptureBar({ onCreateNote }: { onCreateNote?: (noteId:string)=>void }){
  const { addNote, addEntryToNote, notes } = useStore();
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [type, setType] = useState<"idea"|"write-up"|"code"|"design"|"personal">("idea");
  const [tags, setTags] = useState("");
  const timerRef = useRef<number|Window|null>(null);
  const mediaRef = useRef<MediaRecorder|null>(null);

  useEffect(()=>{
    if(recording && !paused){
      timerRef.current = window.setInterval(()=> setElapsed(s=> s+1), 1000);
    } else {
      if(timerRef.current) clearInterval(timerRef.current as number);
    }
    return ()=> { if(timerRef.current) clearInterval(timerRef.current as number); };
  },[recording, paused]);

  const fmt = (s:number)=> `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const startRec = async ()=>{
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      mr.start();
      setRecording(true); setPaused(false); setElapsed(0);
      mr.ondataavailable = ()=>{};
    } catch {
      // fallback: simulate recording without mic
      setRecording(true); setElapsed(0);
    }
  };
  const stopRec = ()=>{
    setRecording(false); setPaused(false);
    if(mediaRef.current && mediaRef.current.state!=="inactive") mediaRef.current.stop();
    // create a note with voice entry simulating transcription
    const noteId = Math.random().toString(36).slice(2,9);
    const newNote = { id: noteId, title: text.slice(0,42) || "Voice note — "+ new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit"}), type, tags: tags.split(",").map(s=> s.trim()).filter(Boolean), pinned:false, archived:false, deletedAt:null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), entries: [] as any[] };
    // We'll add note via store then entry
    // hack: need to use store directly
    // create note first
    const { } = {};
    // Use global store method via DOM event - simpler: call addNote
    addNote(newNote as any);
    // attach voice entry with transcribing -> mock audioPath
    setTimeout(()=>{
      addEntryToNote(noteId, "Transcribing…", "voice", { audioPath:"/mock-audio", duration: elapsed || 12 });
      // simulate transcript replace
      setTimeout(()=>{
        // update that entry body via note update
      }, 600);
    }, 100);
    setElapsed(0);
    onCreateNote?.(noteId);
  };

  const handleSend = ()=>{
    if(!text.trim() && !recording) return;
    if(recording){ stopRec(); return; }
    const noteId = Math.random().toString(36).slice(2,9);
    const newNote:any = { id: noteId, title: text.slice(0,48) || "Untitled note", type, tags: tags.split(",").map(s=> s.trim()).filter(Boolean), pinned:false, archived:false, deletedAt:null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), entries: [{ id: Math.random().toString(36).slice(2,9), noteId, kind:"text", body:text, createdAt: new Date().toISOString() }] };
    addNote(newNote);
    setText(""); setTags("");
    onCreateNote?.(noteId);
  };

  return (
    <div className="rounded-sheet bg-white border border-border shadow-card p-3 md:p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted font-medium">Capture · {recording ? "Recording" : "Ready"} · Sample behavior</span>
        <span className="ml-auto mono text-[11px] text-ink-muted">{fmt(elapsed)}</span>
        {recording && <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />}
      </div>

      <div className="relative">
        <textarea value={text} onChange={e=> setText(e.target.value)} placeholder="Type an idea, paste a quote, or tap record and talk…" rows={3} className="w-full rounded-card border border-border bg-surface-2/60 focus:bg-white p-3 pr-12 text-[15px] leading-6 placeholder:text-ink-muted focus:outline-none focus:border-tide-400 focus:ring-4 focus:ring-tide-100 transition" />
        <button onClick={recording ? stopRec : startRec} className={`absolute right-2 bottom-2 w-9 h-9 rounded-full grid place-items-center text-white shadow-float transition ${recording ? "bg-danger" : "bg-amber-500 hover:bg-amber-600"}`}>
          {recording ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      {/* waveform mock */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-[3px] h-6">
          {[0,1,2,3,4,5,6].map(i=>(
            <span key={i} className="w-[3px] bg-amber-500 rounded-full" style={{ height: recording ? `${8 + Math.abs(Math.sin((elapsed*2+i)))*16}px` : "8px", transition:"height 120ms", opacity: recording?1:0.3 }} />
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden md:flex items-center gap-1.5 text-[12px]">
            <Tag className="w-3.5 h-3.5 text-ink-muted" />
            <input value={tags} onChange={e=> setTags(e.target.value)} placeholder="tags, comma" className="h-8 px-2.5 rounded-full border border-border bg-white text-[13px] w-[160px] focus:outline-none focus:border-tide-300" />
          </div>
          <select value={type} onChange={e=> setType(e.target.value as any)} className="h-8 px-2.5 rounded-full border border-border bg-white text-[13px] font-medium focus:outline-none">
            <option value="idea">idea</option>
            <option value="write-up">write-up</option>
            <option value="code">code</option>
            <option value="design">design</option>
            <option value="personal">personal</option>
          </select>
          <button onClick={handleSend} className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-ink text-white text-[13px] font-semibold hover:bg-black transition">
            <Send className="w-3.5 h-3.5" /> {recording ? "Stop & save" : "Save to Notes"}
          </button>
        </div>
      </div>
      {recording && (
        <div className="mt-3 flex items-center gap-2 text-[13px]">
          <span className="mono text-[11px] tracking-wide uppercase text-ink-soft">Recording · {fmt(elapsed)}</span>
          <button onClick={()=> setPaused(p=>!p)} className="ml-2 inline-flex items-center gap-1 h-7 px-3 rounded-full border border-border bg-white text-[12px] font-medium"><Pause className="w-3 h-3"/>{paused?"Resume":"Pause"}</button>
          <button onClick={stopRec} className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-danger text-white text-[12px] font-medium">Stop</button>
          <span className="mono text-[11px] text-ink-muted ml-auto">Transcribing takes ~20s. Audio is kept.</span>
        </div>
      )}
    </div>
  );
}
