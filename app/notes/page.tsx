"use client";
import { useStore } from "@/lib/store";
import { Pill, TaskCard, IllustrationCard, GlassPill } from "@/components/ui";
import { fmtNoteCard, fmtEntryTime, fmtGroupHeader } from "@/lib/time";
import { Pin, Archive, Trash2, Play, Pause, Sparkles, FileText, Image as ImageIcon, Clock3, Search, X, Copy, Volume2, Mic, Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { mockBlogPost, mockCarouselOutline, mockLinkedInPost } from "@/lib/mockAI";
import { motion } from "framer-motion";

function NoteCardNew({ note, onOpen, onTurnInto }: any){
  const last = note.entries[note.entries.length-1];
  const hasAudio = note.entries.some((e:any)=> e.audioPath);
  const focused = note.pinned;
  return (
    <div onClick={()=> onOpen(note)} className={`rounded-[24px] p-5 cursor-pointer transition ${focused ? "bg-surface shadow-focused border border-transparent" : "bg-surface-flat/60 border border-line hover:bg-surface"}`}>
      <div className="flex items-center gap-2">
        <Pill variant={note.type==="idea"?"blue":"slate"}>{note.type}</Pill>
        {hasAudio && <Pill variant="coral">Voice · {note.entries.find((e:any)=>e.audioDurationSec)?.audioDurationSec || 48}s</Pill>}
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
          <Play className="w-3 h-3 text-teal"/> <span className="text-[12px] text-ink-muted">0:{String(note.entries.find((e:any)=>e.audioDurationSec)?.audioDurationSec||48).padStart(2,"0")}</span>
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

export default function NotesPage(){
  const { notes, addEntryToNote, addDraft, updateNote, deleteNote, search } = useStore();
  const [filterTag, setFilterTag] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [newEntry, setNewEntry] = useState("");
  const [toasts, setToasts] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [text, setText] = useState("");
  const [nowLagos, setNowLagos] = useState("");
  useEffect(()=>{
    const id = setInterval(()=> setElapsed(s=> recording? s+1 : s),1000);
    return ()=> clearInterval(id);
  },[recording]);
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
      const variants = mockLinkedInPost(null,null,bodyCombined);
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
    if(!text.trim()) { if(recording){ setRecording(false); } return; }
    const noteId = Math.random().toString(36).slice(2,9);
    addNote({ id: noteId, title: text.slice(0,48) || "Untitled note", type:"idea", tags: [], pinned:false, archived:false, deletedAt:null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), entries:[{ id: Math.random().toString(36).slice(2,9), noteId, kind:"text", body:text, createdAt: new Date().toISOString() }] } as any);
    setText(""); setRecording(false); setElapsed(0);
  };

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

      {/* Capture bar — glass pill at bottom style */}
      <div className="glass rounded-full p-2 flex items-center gap-3 sticky top-[72px] z-20">
        <input value={text} onChange={e=> setText(e.target.value)} placeholder="Type an idea, or tap mic to talk…" className="flex-1 bg-transparent outline-none px-4 text-[14px] placeholder:text-ink-muted" />
        <div className="flex items-center gap-2">
          {recording && <span className="text-[12px] font-medium text-coral-ink tabular-nums">{Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,"0")}</span>}
          {recording && <div className="flex gap-[3px]">{Array.from({length:7}).map((_,i)=> <span key={i} className="w-[3px] bg-coral rounded-full animate-pulse" style={{height:`${8+Math.sin(Date.now()/200+i)*8}px`}}/> )}</div>}
          <button onClick={()=> { if(recording) handleSave(); else { setRecording(true); setElapsed(0); } }} className={`w-10 h-10 rounded-full grid place-items-center text-on-coral transition ${recording?"bg-coral shadow-fab":"bg-coral shadow-fab"}`}>
            <Mic className="w-5 h-5" />
          </button>
          <button onClick={handleSave} className="h-9 px-4 rounded-full bg-ink text-surface text-[13px] font-medium hidden md:block">Save</button>
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

      {/* Grouped list using new card styles */}
      <div className="space-y-6">
        {grouped.map(([day,list])=>(
          <div key={day} className="space-y-3">
            <h2 className="text-[12px]/[18px] font-normal tracking-widest uppercase text-ink-muted pt-2">{day}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {list.map((n:any)=> <NoteCardNew key={n.id} note={n} onOpen={setActive} onTurnInto={handleTurnInto} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom sheet detail — card expand */}
      {active && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-ink/20 backdrop-blur-sm" onClick={()=> setActive(null)} />
          <motion.div initial={{ y: 20, opacity:0 }} animate={{ y:0, opacity:1 }} className="w-full max-w-[560px] bg-surface rounded-t-[32px] lg:rounded-[32px] m-0 lg:m-4 shadow-sheet overflow-hidden flex flex-col max-h-[90vh] lg:max-h-none">
            <div className="sheet-handle" />
            <div className="h-[56px] border-b border-line flex items-center gap-2 px-4 shrink-0">
              <span className="text-[12px] tracking-widest uppercase text-ink-muted">Note thread · {active.entries.length} entries</span>
              <div className="ml-auto flex gap-1">
                <button onClick={()=> { updateNote(active.id,(n:any)=> ({...n, pinned:!n.pinned})); setActive((a:any)=> ({...a, pinned:!a.pinned})); }} className={`w-8 h-8 rounded-full border grid place-items-center ${active.pinned?"bg-coral-soft border-coral-soft text-coral-ink":"bg-surface border-line text-ink-muted"}`}><Pin className="w-4 h-4"/></button>
                <button onClick={()=> { updateNote(active.id,(n:any)=> ({...n, archived:!n.archived})); setActive(null); }} className="w-8 h-8 rounded-full border border-line bg-surface grid place-items-center text-ink-muted"><Archive className="w-4 h-4"/></button>
                <button onClick={()=> { deleteNote(active.id); setActive(null); }} className="w-8 h-8 rounded-full border border-line bg-surface grid place-items-center text-ink-muted"><Trash2 className="w-4 h-4"/></button>
                <button onClick={()=> setActive(null)} className="w-8 h-8 rounded-full bg-ink text-surface grid place-items-center ml-1"><X className="w-4 h-4"/></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-6">
              <div>
                <h2 className="text-[20px] font-medium leading-tight">{active.title}</h2>
                <div className="flex gap-2 mt-2"><Pill variant="blue">{active.type}</Pill>{active.tags.map((t:string)=> <Pill key={t} variant="slate">{t}</Pill>)}</div>
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
                    <p className="text-[14px]/[24px] mt-2 whitespace-pre-wrap">{e.body}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-[24px] border border-line bg-surface p-4">
                <label className="text-[12px] text-ink-muted">Append to thread</label>
                <input value={newEntry} onChange={e=> setNewEntry(e.target.value)} placeholder="Add typed entry…" className="w-full mt-1 border-0 border-b border-line focus:border-coral outline-none py-2 text-[14px] bg-transparent" />
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>{ if(!newEntry.trim()) return; addEntryToNote(active.id, newEntry, "text"); setActive((a:any)=> ({...a, entries:[...a.entries, { id: Math.random().toString(36).slice(2,9), noteId:a.id, kind:"text", body:newEntry, createdAt:new Date().toISOString()}]})); setNewEntry(""); }} className="h-8 px-4 rounded-full bg-ink text-surface text-[13px] font-medium">Append</button>
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
