"use client";
import { useStore } from "@/lib/store";
import { mockLinkedInPost, mockYearlyCalendar } from "@/lib/mockAI";
import { Sparkles, CalendarDays, PenLine, Copy, Lock, Unlock, Wand2, RefreshCw, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";

function fmtDate(dateStr: string, opts: Intl.DateTimeFormatOptions){
  return new Intl.DateTimeFormat("en-GB", { timeZone:"Africa/Lagos", ...opts }).format(new Date(dateStr));
}
function fmtLagosShort(dateStr:string){
  const d = new Date(dateStr);
  const day = new Intl.DateTimeFormat("en-GB",{ day:"numeric", month:"short", timeZone:"Africa/Lagos"}).format(d);
  const time = new Intl.DateTimeFormat("en-GB",{ hour:"2-digit", minute:"2-digit", hour12:false, timeZone:"Africa/Lagos"}).format(d);
  return `${day} ${time}`;
}

export default function LinkedInPage(){
  const { voiceProfile, setVoiceProfile, linkedinCalendar, setLinkedinCalendar, drafts, addDraft, notes } = useStore();
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [answers, setAnswers] = useState<any>(voiceProfile?.answers || {});
  const [samples, setSamples] = useState(voiceProfile?.samples?.join("\n\n") || "");
  const [generated, setGenerated] = useState<{slotId:string, variants:string[]} | null>(null);
  const [copyOk, setCopyOk] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(()=> setMounted(true),[]);

  const ensureCalendar = ()=>{
    if(linkedinCalendar.length===0){
      const c = mockYearlyCalendar("linkedin").slice(0,60);
      setLinkedinCalendar(c);
    }
  };
  if(mounted && linkedinCalendar.length===0) ensureCalendar();

  const todayStr = new Date().toLocaleDateString("en-CA",{ timeZone:"Africa/Lagos"}); // YYYY-MM-DD
  const todaySlot = linkedinCalendar.find(s=> s.date===todayStr);

  const generateForSlot = (slot:any)=>{
    const noteText = notes[0]?.entries.map(e=> e.body).join("\n") || "";
    const variants = mockLinkedInPost(voiceProfile, slot, noteText);
    setGenerated({ slotId: slot.id, variants });
  };
  const saveDraftFromVariant = (text:string)=>{
    addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId: null, channel:"linkedin", body:text, status:"draft", createdAt: new Date().toISOString() });
  };

  const visible = linkedinCalendar.slice(0,30);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[28px] tracking-tight leading-none">LinkedIn engine</h1>
          <p className="text-[14px] text-ink-soft mt-2 max-w-[60ch]">Three layers: voice profile → year calendar (themes, not posts) → on-demand generation. One request of 365 posts is never used — it becomes repetitive.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=> setInterviewOpen(!interviewOpen)} className="h-9 px-4 rounded-full bg-ink text-white text-[13px] font-semibold inline-flex items-center gap-2"><PenLine className="w-4 h-4"/>Voice profile</button>
          <button onClick={()=>{
            const c = mockYearlyCalendar("linkedin").slice(0,60);
            setLinkedinCalendar(c);
          }} className="h-9 px-4 rounded-full border border-border bg-white text-[13px] font-medium inline-flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Regenerate year</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-card border border-border bg-white p-5">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-tide-500"/> <span className="mono text-[11px] tracking-[0.12em] uppercase font-medium text-ink-muted">Layer 1 · Voice profile (one-time, editable)</span> <span className="ml-auto mono text-[11px] text-ink-muted">Included in every generation</span></div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {Object.entries(voiceProfile?.answers || {}).map(([k,v])=>(
              <div key={k} className="rounded-control border border-border bg-surface-2/60 p-3">
                <div className="mono text-[11px] tracking-[0.08em] uppercase font-medium text-ink-muted">{k}</div>
                <div className="text-[13px] leading-5 mt-1">{v as string}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-control border border-border bg-surface-2 p-3">
            <div className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">Style guide (built into every prompt)</div>
            <p className="text-[13px] leading-5 mt-1">{voiceProfile?.styleGuide}</p>
            <div className="flex flex-wrap gap-2 mt-2 mono text-[11px]">
              <span className="px-2 py-1 rounded-full border border-border bg-white">First person, concrete details</span>
              <span className="px-2 py-1 rounded-full border border-border bg-white">Avoid stock openers & hype closers</span>
              <span className="px-2 py-1 rounded-full border border-border bg-white">Vary hook/length/structure</span>
              <span className="px-2 py-1 rounded-full border border-border bg-white">Flag invented facts</span>
            </div>
          </div>

          {interviewOpen && (
            <div className="mt-4 rounded-card border border-tide-200 bg-tide-50 p-4 space-y-3">
              <h3 className="font-display font-semibold">Interview — answer by typing or voice</h3>
              {["who","specialties","psychology","audience","goals"].map(key=>(
                <div key={key}>
                  <label className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">{key}</label>
                  <textarea value={(answers as any)[key] || ""} onChange={e=> setAnswers({...answers, [key]: e.target.value})} rows={2} className="w-full mt-1 rounded-control border border-border bg-white p-2.5 text-[13px] focus:outline-none focus:border-tide-300" />
                </div>
              ))}
              <div>
                <label className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">Style samples — paste 5–10 of your posts</label>
                <textarea value={samples} onChange={e=> setSamples(e.target.value)} rows={4} placeholder="Paste your writing here…" className="w-full mt-1 rounded-control border border-border bg-white p-2.5 text-[13px] focus:outline-none focus:border-tide-300" />
              </div>
              <button onClick={()=>{
                setVoiceProfile({ answers, styleGuide: voiceProfile?.styleGuide || "Short, concrete, first-person", samples: samples.split("\n\n").filter(Boolean), updatedAt: new Date().toISOString() });
                setInterviewOpen(false);
              }} className="h-9 px-4 rounded-full bg-ink text-white text-[13px] font-semibold">Save profile</button>
            </div>
          )}
        </div>

        <div className="rounded-card border border-border bg-white p-5">
          <div className="mono text-[11px] tracking-[0.12em] uppercase text-ink-muted font-medium">Layer 3 · Post for today</div>
          {todaySlot ? (
            <div className="mt-3 rounded-card border border-amber-200 bg-amber-50 p-4">
              <div className="mono text-[11px] tracking-[0.08em] uppercase text-amber-800">Today · {todaySlot.date}</div>
              <div className="font-display font-semibold mt-1">{todaySlot.topic}</div>
              <div className="text-[13px] text-ink-soft mt-1">{todaySlot.angle} · {todaySlot.postType}</div>
              <button onClick={()=> generateForSlot(todaySlot)} className="mt-3 w-full h-9 rounded-full bg-ink text-white text-[13px] font-semibold inline-flex items-center justify-center gap-2"><Wand2 className="w-4 h-4"/>Generate 2 variants</button>
              <p className="mono text-[11px] text-ink-muted mt-2 text-center">Uses profile + calendar slot + recent notes. Flags invented facts.</p>
            </div>
          ) : (
            <div className="mt-3 rounded-card border border-border bg-surface-2 p-4 text-[13px] text-ink-soft">No slot for today — generate a year calendar.</div>
          )}
          <div className="mt-4 rounded-card border border-border bg-surface-2 p-3">
            <div className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">Human-touch rules</div>
            <ul className="text-[12px] leading-5 mt-2 list-disc pl-4 text-ink-soft">
              <li>Concrete details from profile/notes</li>
              <li>Never claim experiences not in sources</li>
              <li>Vary length/structure/hook consecutively</li>
              <li>Flag posts needing confirmation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-card border border-border bg-white p-5">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-4 h-4 text-ink-muted" />
          <h2 className="font-display font-semibold">Year calendar · themes only (editable slot by slot)</h2>
          <span className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted ml-auto">{visible.length} slots shown</span>
        </div>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map(slot=>(
            <div key={slot.id} className={`rounded-control border p-3 flex flex-col gap-2 ${slot.locked ? "bg-ink text-white border-ink" : "bg-white border-border"}`}>
              <div className="flex items-center gap-2 mono text-[11px] tracking-[0.08em] uppercase">
                <span className={slot.locked?"text-white/70":"text-ink-muted"}>{slot.date} · {slot.postType}</span>
                <button onClick={()=> {
                  setLinkedinCalendar(linkedinCalendar.map(s=> s.id===slot.id ? {...s, locked: !s.locked}: s));
                }} className={`ml-auto w-6 h-6 rounded-full grid place-items-center border ${slot.locked?"bg-white text-ink border-white":"bg-surface-2 text-ink-muted border-border"}`}>
                  {slot.locked? <Lock className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>}
                </button>
              </div>
              <div className={`font-medium text-[13px] leading-5 ${slot.locked?"text-white":"text-ink"}`}>{slot.topic}</div>
              <div className={`text-[12px] ${slot.locked?"text-white/70":"text-ink-soft"}`}>{slot.angle}</div>
              <div className="flex gap-1 mt-1">
                <button onClick={()=> generateForSlot(slot)} className={`h-7 px-3 rounded-full text-[12px] font-medium inline-flex items-center gap-1 ${slot.locked?"bg-white text-ink":"bg-ink text-white"}`}>Generate</button>
                <button onClick={()=>{
                  const newTopic = prompt("Edit topic", slot.topic);
                  if(newTopic) setLinkedinCalendar(linkedinCalendar.map(s=> s.id===slot.id ? {...s, topic:newTopic}: s));
                }} className={`h-7 px-3 rounded-full text-[12px] border ${slot.locked?"border-white/20 text-white":"border-border bg-white text-ink-soft"}`}>Edit</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={()=>{
            const next7 = visible.slice(0,7);
            next7.forEach(s=> {
              const variants = mockLinkedInPost(voiceProfile, s, "");
              addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId:null, channel:"linkedin", body: variants[0], status:"draft", createdAt:new Date().toISOString(), variants });
            });
          }} className="h-9 px-4 rounded-full bg-ink text-white text-[13px] font-semibold">Generate next 7 days</button>
          <button onClick={()=>{
            const next30 = visible.slice(0,30);
            next30.forEach(s=> {
              const variants = mockLinkedInPost(voiceProfile, s, "");
              addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId:null, channel:"linkedin", body: variants[0], status:"draft", createdAt:new Date().toISOString(), variants });
            });
          }} className="h-9 px-4 rounded-full border border-border bg-white text-[13px] font-medium">Generate next 30 days</button>
        </div>
      </div>

      {generated && (
        <div className="rounded-card border border-tide-200 bg-tide-50 p-5">
          <h3 className="font-display font-semibold">Generated — pick a variant</h3>
          <p className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted mt-1">Post for {generated.slotId} · 2 variants · review before publishing</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {generated.variants.map((v,i)=>(
              <div key={i} className="rounded-card bg-white border border-border p-4">
                <div className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">Variant {i+1}</div>
                <p className="text-[14px] leading-6 whitespace-pre-wrap mt-2">{v}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=> { saveDraftFromVariant(v); }} className="h-8 px-3 rounded-full bg-ink text-white text-[13px] font-medium inline-flex items-center gap-1"><Bookmark className="w-3.5 h-3.5"/>Save as draft</button>
                  <button onClick={()=> {navigator.clipboard.writeText(v); setCopyOk(true); setTimeout(()=> setCopyOk(false),1200);}} className="h-8 px-3 rounded-full border border-border bg-white text-[13px] inline-flex items-center gap-1"><Copy className="w-3.5 h-3.5"/>{copyOk?"Copied":"Copy"}</button>
                </div>
                <div className="mono text-[11px] text-ink-muted mt-2">⚑ Flag: check that client story is accurate.</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-card border border-border bg-white p-5">
        <h3 className="font-display font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-tide-500"/> Draft history · {drafts.filter(d=> d.channel==="linkedin").length} LinkedIn drafts</h3>
        <div className="mt-3 space-y-3">
          {drafts.filter(d=> d.channel==="linkedin").slice(0,6).map(d=>(
            <div key={d.id} className="rounded-control border border-border bg-surface-2/40 p-3">
              <div className="flex items-center gap-2 mono text-[11px] tracking-[0.08em] uppercase text-ink-muted"><span suppressHydrationWarning>{fmtLagosShort(d.createdAt)}</span><span className={`px-2 py-0.5 rounded-full border ${d.status==="posted"?"bg-ink text-white border-ink": d.status==="ready"?"bg-amber-50 border-amber-200 text-amber-700":"bg-white border-border"}`}>{d.status}</span></div>
              <p className="text-[13px] leading-5 whitespace-pre-wrap mt-2">{d.body.slice(0,220)}…</p>
              <div className="flex gap-1 mt-2">
                <button onClick={()=> navigator.clipboard.writeText(d.body)} className="h-7 px-3 rounded-full border border-border bg-white text-[12px]">Copy</button>
                <button onClick={()=> addDraft({...d, id: Math.random().toString(36).slice(2,9)})} className="h-7 px-3 rounded-full border border-border bg-white text-[12px]">Duplicate</button>
              </div>
            </div>
          ))}
          {drafts.filter(d=> d.channel==="linkedin").length===0 && <p className="text-[13px] text-ink-soft">No drafts yet. Generate from a slot or turn a note into a post.</p>}
        </div>
      </div>
    </div>
  );
}
