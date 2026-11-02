"use client";
import { useStore } from "@/lib/store";
import { Pill, IllustrationCard } from "@/components/ui";
import { fmtNoteCard, fmtEntryTime, fmtGroupHeader } from "@/lib/time";
import { Pin, Archive, Trash2, Play, Pause, Sparkles, Clock3, Search, X, Copy, Mic, Square, MicOff, Linkedin, Instagram as IGIcon, FileText, Wand2, ChevronDown } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { mockBlogPost, mockCarouselOutline, mockLinkedInPost, formatNoteForSocial } from "@/lib/mockAI";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceTranscription } from "@/lib/useVoice";

function NoteCardNew({ note, onOpen, onTurnInto }: any){
  const last = note.entries[note.entries.length-1];
  const hasAudio = note.entries.some((e:any)=> e.audioPath);
  const focused = note.pinned;
  return (
    <div onClick={()=> onOpen(note)} className={`rounded-[24px] p-5 cursor-pointer transition ${focused ? "bg-surface shadow-focused border border-transparent" : "bg-surface-flat/60 border border-line hover:bg-surface"}`}>
      <div className="flex items-center gap-2">
        <Pill variant={note.type==="idea"?"blue":"slate"}>{note.type}</Pill>
        {hasAudio && <Pill variant="coral">Voice · {note.entries.find((e:any)=>e.audioDurationSec)?.audioDurationSec || 12}s</Pill>}
        {note.pinned && <span className="ml-auto text-[10px] tracking-widest uppercase text-coral-ink bg-coral-soft px-2 py-1 rounded-full">Pinned</span>}
      </div>
      <div className="text-[16px]/[24px] font-medium text-ink mt-3 line-clamp-2">{note.title}</div>
      <div className="text-[15px]/[24px] text-ink mt-2 line-clamp-3">{last?.body}</div>
      <div className="flex items-center gap-2 mt-3 text-[12px] text-ink-muted">
        <Clock3 className="w-3 h-3"/> <span suppressHydrationWarning>{fmtNoteCard(note.createdAt)}</span>
        <span className="ml-auto flex gap-1">{note.tags.slice(0,2).map((t:string)=> <span key={t} className="text-[11px] bg-surface border border-line px-2 py-1 rounded-full">{t}</span>)}</span>
      </div>
      {hasAudio && (
        <div className="mt-3 flex items-center gap-2 rounded-full bg-surface border border-line px-3 py-2 w-fit">
          <Play className="w-3 h-3 text-teal"/> <span className="text-[12px] text-ink-muted">0:{String(note.entries.find((e:any)=>e.audioDurationSec)?.audioDurationSec||12).padStart(2,"0")}</span>
          <div className="flex gap-[2px] ml-2">{Array.from({length:7}).map((_,i)=> <span key={i} className="w-[3px] h-[8px] bg-blue-soft rounded-full"/> )}</div>
        </div>
      )}
      <div className="flex gap-2 mt-4">
        <button onClick={(e)=>{e.stopPropagation(); onTurnInto(note,"linkedin")}} className="h-7 px-3 rounded-full bg-surface border border-line text-[12px] font-medium">LinkedIn</button>
        <button onClick={(e)=>{e.stopPropagation(); onTurnInto(note,"blog")}} className="h-7 px-3 rounded-full bg-surface border border-line text-[12px]">Blog</button>
        <button onClick={(e)=>{e.stopPropagation(); onTurnInto(note,"instagram")}} className="h-7 px-3 rounded-full bg-coral-soft text-coral-ink text-[12px] font-medium">Carousel</button>
      </div>
    </div>
  );
}

function LinedEditor({ text, setText, voice }: { text: string; setText: (v:string)=>void; voice: ReturnType<typeof useVoiceTranscription> }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  // when interim arrives, sync to textarea but allow editing
  const handleVoiceToggle = () => {
    if (voice.state === "recording") {
      const final = voice.stop();
      // append final to text (or set if empty)
      if (final) {
        setText((text ? text + (text.endsWith(" ") ? "" : " ") + final : final) as string);
      }
    } else {
      voice.start();
    }
  };
  // live display: if recording, show text + transcript + interim
  const displayPlaceholder = "Tap to write — an idea, a quote, a voice note… lines are here to guide you.";
  return (
    <div className={`rounded-[24px] border bg-surface overflow-hidden transition ${focused || voice.state==="recording" ? "border-teal shadow-focused" : "border-line"}`}>
      {/* lined paper area */}
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none rounded-[24px] overflow-hidden" aria-hidden>
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, var(--line) 31px, var(--line) 32px)`,
            backgroundPosition: "0 18px",
            opacity: 0.7
          }} />
          {/* left margin line */}
          <div className="absolute left-[48px] top-0 bottom-0 w-[2px] bg-coral/20" />
        </div>
        <textarea
          ref={ref}
          value={voice.state==="recording" ? (text ? text + " " + voice.transcript + (voice.interimText ? " " + voice.interimText : "") : voice.transcript + (voice.interimText ? " " + voice.interimText : "")) : text}
          onChange={(e)=>{
            // while recording, editing should update transcript buffer, but we translate to text+voice
            if (voice.state==="recording") {
              // if user edits during recording, pause and set text accordingly
              voice.setTranscript(e.target.value.slice((text? text.length+1:0)));
              setText(e.target.value);
            } else {
              setText(e.target.value);
            }
          }}
          onFocus={()=> setFocused(true)}
          onBlur={()=> setFocused(false)}
          placeholder={displayPlaceholder}
          rows={6}
          className="relative w-full min-h-[168px] bg-transparent px-6 pl-[56px] pt-[18px] pb-[16px] text-[15px]/[32px] text-ink placeholder:text-ink-muted focus:outline-none resize-none"
          style={{ lineHeight: "32px" }}
        />
        {/* floating mic controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {voice.state==="recording" && (
            <span className="h-7 px-3 rounded-full bg-coral-soft text-coral-ink text-[12px] font-medium inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-coral animate-pulse" /> {Math.floor(voice.elapsed/60)}:{String(voice.elapsed%60).padStart(2,"0")} · Transcribing live
            </span>
          )}
          {voice.error && <span className="text-[11px] text-ink-muted">{voice.error}</span>}
          <button onClick={handleVoiceToggle} className={`w-10 h-10 rounded-full grid place-items-center text-on-coral transition shadow-fab ${voice.state==="recording"?"bg-ink":"bg-coral hover:bg-coral/90"}`} aria-label="Toggle mic">
            {voice.state==="recording" ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {/* toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-line bg-surface-flat/40">
        <span className="text-[11px] tracking-widest uppercase text-ink-muted">{text ? `${text.split(/\s+/).filter(Boolean).length} words` : "Empty note"}</span>
        {voice.state==="recording" && <span className="text-[11px] text-coral-ink ml-2">● Listening — tap square to stop & keep text</span>}
        <span className="ml-auto text-[11px] text-ink-muted hidden md:inline">Lines guide you — tap anywhere to start writing</span>
        <button
          onClick={()=> {
            if (voice.state==="recording") {
              // also stop recording on explicit save
              const final = voice.stop();
              if (final && !text) setText(final);
            }
          }}
          className="ml-2 h-7 px-3 rounded-full border border-line bg-surface text-[11px] text-ink-muted"
        >
          Edit transcription
        </button>
      </div>
    </div>
  );
}

export default function NotesPage(){
  const { notes, addEntryToNote, addDraft, updateNote, deleteNote, search } = useStore();
  const [filterTag, setFilterTag] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [newEntry, setNewEntry] = useState("");
  const [toasts, setToasts] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [nowLagos, setNowLagos] = useState("");
  const voice = useVoiceTranscription();

  // separate voice for detail append
  const detailVoice = useVoiceTranscription();
  const [activeSocial, setActiveSocial] = useState<"none"|"linkedin"|"instagram">("none");
  const [activeGenerated, setActiveGenerated] = useState<string>("");
  const [activeWordCount, setActiveWordCount] = useState<50|100|200>(100);
  const [originalBodySnapshot, setOriginalBodySnapshot] = useState("");

  useEffect(()=>{
    const tick = ()=> setNowLagos(new Intl.DateTimeFormat("en-GB",{ hour:"2-digit", minute:"2-digit", hour12:false, timeZone:"Africa/Lagos"}).format(new Date()));
    tick(); const id=setInterval(tick,60000); return ()=> clearInterval(id);
  },[]);

  const filtered = useMemo(()=>{
    let list = notes.filter(n=> !n.deletedAt);
    if(!showArchived) list = list.filter(n=> !n.archived);
    if(search) list = list.filter(n=> (n.title+" "+n.tags.join(" ")+" "+n.entries.map(e=>e.body).join(" ")).toLowerCase().includes(search.toLowerCase()));
    if(filterTag) list = list.filter(n=> n.tags.includes(filterTag));
    if(filterType) list = list.filter(n=> n.type===filterType);
    return list.sort((a,b)=> +new Date(b.updatedAt) - +new Date(a.updatedAt));
  },[notes, search, filterTag, filterType, showArchived]);

  const grouped = useMemo(()=>{
    const m = new Map<string, typeof filtered>();
    filtered.forEach(n=>{
      const k = fmtGroupHeader(n.updatedAt);
      if(!m.has(k)) m.set(k, []);
      m.get(k)!.push(n);
    });
    return Array.from(m.entries());
  },[filtered]);

  const allTags = Array.from(new Set(notes.flatMap(n=> n.tags)));

  const handleTurnInto = (note:any, channel:"linkedin"|"blog"|"instagram")=>{
    const bodyCombined = note.entries.map((e:any)=> e.body).join("\n\n");
    let body="";
    if(channel==="linkedin"){
      const variants = mockLinkedInPost(null,null,bodyCombined,100);
      body = variants[0];
      addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId: note.id, channel, body, status:"draft", createdAt: new Date().toISOString(), variants });
    } else if(channel==="blog"){
      body = mockBlogPost(bodyCombined, note.title);
      addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId: note.id, channel, body, title: note.title, status:"draft", createdAt: new Date().toISOString() });
    } else {
      const out = mockCarouselOutline(bodyCombined);
      body = `**${out.title}**\n\n` + out.slides.map(s=> `Slide ${s.n}: ${s.text} — ${s.note}`).join("\n") + `\n\nCaption: ${out.caption}\n${out.hashtags.join(" ")}`;
      addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId: note.id, channel, body, title: out.title, status:"draft", createdAt: new Date().toISOString() });
    }
    setToasts(t=> [...t, `Draft created → ${channel}`]);
    setTimeout(()=> setToasts(t=> t.slice(1)), 2600);
  };

  const { addNote } = useStore();

  const handleSave = ()=>{
    // Merge typed text + any live transcript pending
    let finalText = text.trim();
    if (voice.state==="recording") {
      const pending = voice.stop();
      if (pending) finalText = (finalText ? finalText + " " : "") + pending;
      // also include interim if present
      if (voice.interimText) finalText = (finalText ? finalText + " " : "") + voice.interimText;
    } else if (voice.transcript) {
      // if voice finished earlier but user didn't append automatically, include
      if (!finalText.includes(voice.transcript)) {
        finalText = (finalText ? finalText + " " : "") + voice.transcript;
      }
    }

    if(!finalText){
      // allow saving voice-only notes even if text state was empty — we already merged
      if(voice.transcript) finalText = voice.transcript;
      else return;
    }

    const noteId = Math.random().toString(36).slice(2,9);
    const hasAudio = voice.elapsed>0 || voice.transcript.length>0;
    addNote({ id: noteId, title: finalText.slice(0,56) || "Untitled note", type:"idea", tags: [], pinned:false, archived:false, deletedAt:null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), entries:[{ id: Math.random().toString(36).slice(2,9), noteId, kind: hasAudio ? "voice" : "text", body: finalText, createdAt: new Date().toISOString(), audioPath: hasAudio ? "voice://"+noteId : undefined, audioDurationSec: hasAudio ? voice.elapsed || 12 : undefined, transcriptStatus: hasAudio ? "done" : undefined } as any] } as any);
    setText(""); voice.reset(); setToasts(t=> [...t, "Note saved ✓"]); setTimeout(()=> setToasts(t=>t.slice(1)), 1800);
  };

  const openNote = (n:any) => {
    setActive(n);
    setActiveSocial("none");
    setActiveGenerated("");
    setOriginalBodySnapshot(n.entries.map((e:any)=>e.body).join("\n\n"));
    setActiveWordCount(100);
    detailVoice.reset();
  };

  const generateSocial = (platform:"linkedin"|"instagram", wordCount: number) => {
    if (!active) return;
    const base = active.entries.map((e:any)=> e.body).join("\n\n");
    if (platform==="linkedin") {
      const v = mockLinkedInPost(null,null,base,wordCount as any);
      setActiveGenerated(v[0]);
    } else {
      const v = formatNoteForSocial(base, "instagram");
      setActiveGenerated(v);
    }
  };

  const wordOptions: (50|100|200)[] = [50,100,200];

  return (
    <div className="space-y-6">
      {/* Hero with illustration card */}
      <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-surface rounded-[24px] border border-line p-6">
          <div className="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-ink-muted border border-line rounded-full px-3 py-1">Calm first · Layers, not boxes</div>
          <h1 className="text-[32px]/[40px] font-normal text-ink mt-3">A soft, airy workspace for <span className="text-teal">notes & voice</span></h1>
          <p className="text-[15px]/[24px] text-ink mt-3">Large rounded shapes, frosted glass sheets, light Montserrat type. Coral appears only where you act — recording, selected, FAB.</p>
          <div className="flex gap-2 mt-4">
            <Pill variant="blue">Pale cool neutrals 80%</Pill>
            <Pill variant="coral">Coral 5%</Pill>
          </div>
        </div>
        <div className="pt-2 pb-10">
          <IllustrationCard title="Why clients go quiet after a quote" subtitle="Three reasons — unclear scope, no next step, price before value" />
        </div>
      </div>

      {/* New Lined Capture Area */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] tracking-widest uppercase text-ink-muted font-medium">New note — tap to write or speak</span>
          <span className="text-[11px] text-ink-muted ml-auto hidden md:inline">Supports live transcription — edit anytime</span>
        </div>
        <LinedEditor text={text} setText={setText} voice={voice} />
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="h-10 px-6 rounded-full bg-ink text-surface text-[13px] font-medium inline-flex items-center gap-2">Save note <span className="opacity-60">↵</span></button>
          <button onClick={()=> { setText(""); voice.reset(); }} className="h-10 px-4 rounded-full border border-line bg-surface text-[13px]">Clear</button>
          <span className="text-[11px] text-ink-muted ml-auto">{voice.state==="recording" ? "Recording — tap square to keep transcript" : (text ? "Tap mic to dictate, or keep typing" : "Tip: dictate for fast capture, then edit lines")}</span>
        </div>
      </div>

      {/* Filters as pills */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex gap-1 rounded-full border border-line bg-surface p-1">
          <button onClick={()=> setShowArchived(false)} className={`h-7 px-3 rounded-full text-[13px] font-medium ${!showArchived?"bg-ink text-surface":"text-ink-muted"}`}>Active</button>
          <button onClick={()=> setShowArchived(true)} className={`h-7 px-3 rounded-full text-[13px] font-medium ${showArchived?"bg-ink text-surface":"text-ink-muted"}`}>Archived</button>
        </div>
        <select value={filterType} onChange={e=> setFilterType(e.target.value)} className="h-8 px-3 rounded-full border border-line bg-surface text-[13px]">
          <option value="">All types</option><option value="idea">idea</option><option value="write-up">write-up</option><option value="code">code</option><option value="design">design</option>
        </select>
        <select value={filterTag} onChange={e=> setFilterTag(e.target.value)} className="h-8 px-3 rounded-full border border-line bg-surface text-[13px]">
          <option value="">All tags</option>{allTags.map(t=> <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-[12px] text-ink-muted ml-auto">{filtered.length} notes · grouped by day</span>
      </div>

      {/* Grouped list */}
      {filtered.length===0 ? (
        <div className="rounded-[24px] border border-dashed border-line bg-surface p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-flat border border-line grid place-items-center mx-auto"><FileText className="w-5 h-5 text-ink-muted"/></div>
          <div className="text-[14px] font-medium text-ink mt-3">No notes yet</div>
          <div className="text-[13px] text-ink-muted mt-1">Use the lined paper above — type or tap mic. Your voice becomes editable text.</div>
        </div>
      ) : (
      <div className="space-y-6">
        {grouped.map(([day,list])=>(
          <div key={day} className="space-y-3">
            <h2 className="text-[12px]/[18px] font-normal tracking-widest uppercase text-ink-muted pt-2">{day}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {list.map((n:any)=> <NoteCardNew key={n.id} note={n} onOpen={openNote} onTurnInto={handleTurnInto} />)}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Bottom sheet detail */}
      {active && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-ink/20 backdrop-blur-sm" onClick={()=> { if(detailVoice.state==="recording") detailVoice.stop(); setActive(null); }} />
          <motion.div initial={{ y: 20, opacity:0 }} animate={{ y:0, opacity:1 }} className="w-full max-w-[640px] bg-surface rounded-t-[32px] lg:rounded-[32px] m-0 lg:m-4 shadow-sheet overflow-hidden flex flex-col max-h-[92vh] lg:max-h-[90vh]">
            <div className="sheet-handle" />
            <div className="h-[56px] border-b border-line flex items-center gap-2 px-4 shrink-0">
              <span className="text-[12px] tracking-widest uppercase text-ink-muted">Note thread · {active.entries.length} entries</span>
              <div className="ml-auto flex gap-1">
                <button onClick={()=> { updateNote(active.id,(n:any)=> ({...n, pinned:!n.pinned})); setActive((a:any)=> ({...a, pinned:!a.pinned})); }} className={`w-8 h-8 rounded-full border grid place-items-center ${active.pinned?"bg-coral-soft border-coral-soft text-coral-ink":"bg-surface border-line text-ink-muted"}`}><Pin className="w-4 h-4"/></button>
                <button onClick={()=> { updateNote(active.id,(n:any)=> ({...n, archived:!n.archived})); setActive(null); }} className="w-8 h-8 rounded-full border border-line bg-surface grid place-items-center text-ink-muted"><Archive className="w-4 h-4"/></button>
                <button onClick={()=> { deleteNote(active.id); setActive(null); }} className="w-8 h-8 rounded-full border border-line bg-surface grid place-items-center text-ink-muted"><Trash2 className="w-4 h-4"/></button>
                <button onClick={()=> { if(detailVoice.state==="recording") detailVoice.stop(); setActive(null); }} className="w-8 h-8 rounded-full bg-ink text-surface grid place-items-center ml-1"><X className="w-4 h-4"/></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-6">
              <div>
                <h2 className="text-[20px] font-medium leading-tight text-ink">{active.title}</h2>
                <div className="flex gap-2 mt-2"><Pill variant="blue">{active.type}</Pill>{active.tags.map((t:string)=> <Pill key={t} variant="slate">{t}</Pill>)}</div>
              </div>

              {/* Social formatting toggles */}
              <div className="rounded-[24px] border border-line bg-bg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] tracking-widest uppercase text-ink-muted font-medium">Social formatting — preview toggle</span>
                  <span className="ml-auto text-[11px] text-ink-muted">Turn any note (even 2 lines) into a post</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={()=>{
                    if(activeSocial==="linkedin"){ setActiveSocial("none"); setActiveGenerated(""); }
                    else { setActiveSocial("linkedin"); generateSocial("linkedin", activeWordCount); }
                  }} className={`h-8 px-4 rounded-full text-[12px] font-medium inline-flex items-center gap-2 border ${activeSocial==="linkedin"?"bg-[#0A66C2] text-white border-[#0A66C2]":"bg-surface border-line text-ink"}`}>
                    <Linkedin className="w-3.5 h-3.5"/> LinkedIn {activeSocial==="linkedin"?"✓":""}
                  </button>
                  <button onClick={()=>{
                    if(activeSocial==="instagram"){ setActiveSocial("none"); setActiveGenerated(""); }
                    else { setActiveSocial("instagram"); generateSocial("instagram", 100); }
                  }} className={`h-8 px-4 rounded-full text-[12px] font-medium inline-flex items-center gap-2 border ${activeSocial==="instagram"?"bg-gradient-to-r from-[#F58529] to-[#DD2A7B] text-white border-transparent":"bg-surface border-line text-ink"}`}>
                    <IGIcon className="w-3.5 h-3.5"/> Instagram {activeSocial==="instagram"?"✓":""}
                  </button>
                  <span className="text-[11px] text-ink-muted self-center">Unclick to revert to original</span>
                </div>

                {/* LinkedIn word count + generate expand */}
                <AnimatePresence>
                  {activeSocial==="linkedin" && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
                      <div className="pt-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] tracking-widest uppercase text-ink-muted">Length</span>
                          <div className="inline-flex rounded-full border border-line bg-surface p-1 gap-1">
                            {wordOptions.map(w=>(
                              <button key={w} onClick={()=> { setActiveWordCount(w); generateSocial("linkedin", w); }} className={`h-7 px-3 rounded-full text-[12px] font-medium ${activeWordCount===w?"bg-ink text-surface":"text-ink-muted"}`}>{w} words</button>
                            ))}
                          </div>
                          <button onClick={()=> generateSocial("linkedin", activeWordCount)} className="ml-auto h-8 px-3 rounded-full bg-ink text-surface text-[12px] inline-flex items-center gap-1"><Wand2 className="w-3 h-3"/> Generate</button>
                        </div>
                        {activeGenerated && (
                          <motion.div layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="rounded-[16px] border border-line bg-surface p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] tracking-widest uppercase text-ink-muted">LinkedIn preview — editable, human & story-like</span>
                              <span className="ml-auto text-[11px] text-ink-muted">{activeGenerated.split(/\s+/).length} words</span>
                            </div>
                            <textarea value={activeGenerated} onChange={e=> setActiveGenerated(e.target.value)} rows={6} className="w-full mt-2 rounded-[12px] border border-line bg-surface-flat p-3 text-[14px]/[22px] text-ink focus:outline-none focus:border-teal" />
                            <div className="flex gap-2 mt-3">
                              <button onClick={()=>{
                                const v = activeGenerated;
                                addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId: active.id, channel:"linkedin", body: v, status:"draft", createdAt: new Date().toISOString(), variants:[v] });
                                setToasts(t=> [...t, "LinkedIn draft saved"]); setTimeout(()=> setToasts(t=> t.slice(1)),2000);
                              }} className="h-8 px-4 rounded-full bg-ink text-surface text-[12px] font-medium">Save as draft</button>
                              <button onClick={()=> navigator.clipboard.writeText(activeGenerated)} className="h-8 px-3 rounded-full border border-line bg-surface text-[12px] inline-flex items-center gap-1"><Copy className="w-3 h-3"/>Copy</button>
                              <button onClick={()=> setActiveSocial("none")} className="ml-auto text-[12px] text-ink-muted">Revert to original</button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  {activeSocial==="instagram" && activeGenerated && (
                    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="rounded-[16px] border border-line bg-surface p-4">
                      <div className="text-[11px] tracking-widest uppercase text-ink-muted">Instagram preview — editable</div>
                      <textarea value={activeGenerated} onChange={e=> setActiveGenerated(e.target.value)} rows={5} className="w-full mt-2 rounded-[12px] border border-line bg-surface-flat p-3 text-[14px]/[22px] text-ink focus:outline-none focus:border-teal" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={()=>{
                          addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId: active.id, channel:"instagram", body: activeGenerated, status:"draft", createdAt:new Date().toISOString() });
                          setToasts(t=> [...t, "Instagram draft saved"]); setTimeout(()=> setToasts(t=>t.slice(1)),2000);
                        }} className="h-8 px-4 rounded-full bg-ink text-surface text-[12px]">Save</button>
                        <button onClick={()=> setActiveSocial("none")} className="h-8 px-3 rounded-full border border-line bg-surface text-[12px]">Revert</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {activeSocial!=="none" && !activeGenerated && (
                  <div className="text-[12px] text-ink-muted">Tap Generate to see post</div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={()=> handleTurnInto(active,"linkedin")} className="h-9 px-4 rounded-full bg-ink text-surface text-[13px] font-medium inline-flex items-center gap-1.5"><Sparkles className="w-4 h-4"/>Turn into LinkedIn</button>
                <button onClick={()=> handleTurnInto(active,"blog")} className="h-9 px-4 rounded-full border border-line bg-surface text-[13px]">Blog post</button>
                <button onClick={()=> handleTurnInto(active,"instagram")} className="h-9 px-4 rounded-full bg-coral-soft text-coral-ink text-[13px] font-medium">Carousel</button>
              </div>

              <div className="space-y-3">
                {active.entries.map((e:any)=>(
                  <div key={e.id} className="rounded-[24px] border border-line bg-surface-flat/40 p-4">
                    <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-ink-muted"><span className={`px-2 py-0.5 rounded-full border text-[10px] ${e.kind==="voice"?"bg-coral-soft border-coral-soft text-coral-ink":"bg-surface border-line"}`}>{e.kind} · {fmtEntryTime(e.createdAt)}</span>{e.transcriptStatus==="transcribing" && <span className="text-coral-ink flex items-center gap-1"><Clock3 className="w-3 h-3"/>Transcribing…</span>}</div>
                    <p className="text-[14px]/[24px] mt-2 whitespace-pre-wrap text-ink">{(activeSocial!=="none" && activeGenerated && e===active.entries[0]) ? activeGenerated : e.body}</p>
                    {e.audioPath && (
                      <div className="mt-3 flex items-center gap-2">
                        <audio controls src={e.audioPath.startsWith("voice://") ? undefined : e.audioPath} className="h-8 w-full max-w-[220px]" />
                        <span className="text-[11px] text-ink-muted">{e.audioDurationSec || 0}s · {e.transcriptStatus}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Append with mic transcription */}
              <div className="rounded-[24px] border border-line bg-surface p-4 space-y-3">
                <label className="text-[12px] text-ink-muted">Append to thread — type or speak, then edit</label>
                <div className="relative">
                  <textarea
                    value={detailVoice.state==="recording" ? (newEntry ? newEntry + " " + detailVoice.transcript + (detailVoice.interimText ? " "+detailVoice.interimText : "") : detailVoice.transcript + (detailVoice.interimText ? " "+detailVoice.interimText : "")) : newEntry}
                    onChange={e=> {
                      if(detailVoice.state==="recording"){
                        // keep in sync
                        setNewEntry(e.target.value);
                      } else setNewEntry(e.target.value);
                    }}
                    placeholder="Add typed entry or tap mic to dictate…"
                    rows={3}
                    className="w-full rounded-[16px] border border-line bg-surface-flat p-3 pr-12 text-[14px] leading-6 focus:outline-none focus:border-teal"
                  />
                  <button onClick={()=>{
                    if(detailVoice.state==="recording"){
                      const t = detailVoice.stop();
                      if(t) setNewEntry(prev=> (prev ? prev + " " : "") + t + (detailVoice.interimText ? " "+detailVoice.interimText : ""));
                    } else detailVoice.start();
                  }} className={`absolute right-2 bottom-2 w-8 h-8 rounded-full grid place-items-center ${detailVoice.state==="recording"?"bg-ink text-surface":"bg-coral text-on-coral"}`}>
                    {detailVoice.state==="recording" ? <Square className="w-3 h-3 fill-white"/> : <Mic className="w-4 h-4"/>}
                  </button>
                </div>
                {detailVoice.state==="recording" && <div className="text-[11px] text-coral-ink">● Live transcription — speak clearly, edit after you stop</div>}
                <div className="flex gap-2">
                  <button onClick={()=>{ const final = newEntry.trim() || detailVoice.transcript; if(!final) return; addEntryToNote(active.id, final, detailVoice.transcript ? "voice" : "text", detailVoice.transcript ? { duration: detailVoice.elapsed } : undefined); setActive((a:any)=> ({...a, entries:[...a.entries, { id: Math.random().toString(36).slice(2,9), noteId:a.id, kind: detailVoice.transcript ? "voice" : "text", body:final, createdAt: new Date().toISOString(), audioDurationSec: detailVoice.elapsed || undefined }]})); setNewEntry(""); detailVoice.reset(); }} className="h-8 px-4 rounded-full bg-ink text-surface text-[13px] font-medium">Append</button>
                  <span className="text-[11px] text-ink-muted ml-auto self-center">Africa/Lagos · {nowLagos}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 space-y-2">
        {toasts.map((t,i)=> <div key={i} className="bg-ink text-surface rounded-full px-4 py-2 text-[13px] font-medium">{t}</div>)}
      </div>
    </div>
  );
}
