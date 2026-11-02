"use client";
import { useStore } from "@/lib/store";
import { mockLinkedInPost, mockYearlyCalendar } from "@/lib/mockAI";
import { Sparkles, CalendarDays, PenLine, Copy, Lock, Unlock, Wand2, RefreshCw, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<50|100|200>(100);
  const [copyOk, setCopyOk] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(()=> setMounted(true),[]);

  const ensureCalendar = ()=>{
    if(linkedinCalendar.length===0){
      const c = mockYearlyCalendar("linkedin").slice(0,60);
      setLinkedinCalendar(c);
    }
  };
  if(mounted && linkedinCalendar.length===0) ensureCalendar();

  const todayStr = new Date().toLocaleDateString("en-CA",{ timeZone:"Africa/Lagos"});
  const todaySlot = linkedinCalendar.find(s=> s.date===todayStr);
  const generateForSlot = (slot:any, wc:number = wordCount)=>{
    const noteText = notes[0]?.entries.map(e=> e.body).join("\n") || "";
    const variants = mockLinkedInPost(voiceProfile, slot, noteText, wc);
    setGenerated({ slotId: slot.id, variants });
    setExpandedSlot(slot.id);
    // scroll to generated area after expand
    setTimeout(()=> document.getElementById("linkedin-generated")?.scrollIntoView({ behavior:"smooth", block:"start" }), 200);
  };
  const saveDraftFromVariant = (text:string)=>{
    addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId: null, channel:"linkedin", body:text, status:"draft", createdAt: new Date().toISOString(), variants: [text] });
  };
  const visible = linkedinCalendar.slice(0,30);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-normal text-ink tracking-tight leading-none">LinkedIn engine</h1>
          <p className="text-[14px] text-ink-muted mt-2 max-w-[60ch]">Human-first stories — concrete moments, Lagos time, gentle voice. Pick length before you generate.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=> setInterviewOpen(!interviewOpen)} className="h-9 px-4 rounded-full bg-ink text-surface text-[13px] font-medium inline-flex items-center gap-2"><PenLine className="w-4 h-4"/>Voice profile</button>
          <button onClick={()=>{ const c = mockYearlyCalendar("linkedin").slice(0,60); setLinkedinCalendar(c); }} className="h-9 px-4 rounded-full border border-line bg-surface text-ink text-[13px] font-medium inline-flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Regenerate year</button>
        </div>
      </div>

      {/* word count selector global */}
      <div className="rounded-[24px] border border-line bg-surface p-4 flex flex-wrap items-center gap-3">
        <span className="text-[11px] tracking-widest uppercase text-ink-muted font-medium">Word length for next generate</span>
        <div className="inline-flex rounded-full border border-line bg-surface-flat p-1 gap-1">
          {([50,100,200] as const).map(w=>(
            <button key={w} onClick={()=> setWordCount(w)} className={`h-7 px-4 rounded-full text-[12px] font-medium transition ${wordCount===w ? "bg-ink text-surface shadow-sm" : "text-ink-muted hover:text-ink"}`}>{w} words</button>
          ))}
        </div>
        <span className="text-[11px] text-ink-muted">Posts are tuned to feel human — story, pause, close. ~{wordCount} words + human hooks.</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-[24px] border border-line bg-surface p-6">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal"/> <span className="text-[11px] tracking-widest uppercase font-medium text-ink-muted">Layer 1 · Voice profile (one-time, editable)</span> <span className="ml-auto text-[11px] text-ink-muted">Included in every generation</span></div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {Object.entries(voiceProfile?.answers || {}).map(([k,v])=>(
              <div key={k} className="rounded-[12px] border border-line bg-surface-flat p-4">
                <div className="text-[11px] tracking-widest uppercase font-medium text-ink-muted">{k}</div>
                <div className="text-[13px] leading-5 mt-1 text-ink">{v as string}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[12px] border border-line bg-surface-flat p-4">
            <div className="text-[11px] tracking-widest uppercase text-ink-muted">Style guide (built into every prompt)</div>
            <p className="text-[13px] leading-5 mt-1 text-ink">{voiceProfile?.styleGuide}</p>
            <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
              <span className="px-3 py-1 rounded-full border border-line bg-surface text-ink">First person, concrete details</span>
              <span className="px-3 py-1 rounded-full border border-line bg-surface text-ink">Avoid stock openers & hype closers</span>
              <span className="px-3 py-1 rounded-full border border-line bg-surface text-ink">Vary hook/length/structure</span>
              <span className="px-3 py-1 rounded-full bg-coral-soft text-coral-ink border border-coral/10">Flag invented facts</span>
            </div>
          </div>
          {interviewOpen && (
            <div className="mt-4 rounded-[24px] border border-line bg-bg p-5 space-y-3">
              <h3 className="font-medium text-ink">Interview — answer by typing or voice</h3>
              {["who","specialties","psychology","audience","goals"].map(key=>(
                <div key={key}>
                  <label className="text-[11px] tracking-widest uppercase text-ink-muted">{key}</label>
                  <textarea value={(answers as any)[key] || ""} onChange={e=> setAnswers({...answers, [key]: e.target.value})} rows={2} className="w-full mt-1 rounded-[12px] border border-line bg-surface p-2.5 text-[13px] text-ink focus:outline-none focus:border-teal" />
                </div>
              ))}
              <div>
                <label className="text-[11px] tracking-widest uppercase text-ink-muted">Style samples — paste 5–10 of your posts</label>
                <textarea value={samples} onChange={e=> setSamples(e.target.value)} rows={4} placeholder="Paste your writing here…" className="w-full mt-1 rounded-[12px] border border-line bg-surface p-2.5 text-[13px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-teal" />
              </div>
              <button onClick={()=>{ setVoiceProfile({ answers, styleGuide: voiceProfile?.styleGuide || "Short, concrete, first-person — human, story-like, relatable. Lagos context when relevant.", samples: samples.split("\n\n").filter(Boolean), updatedAt: new Date().toISOString() }); setInterviewOpen(false); }} className="h-9 px-4 rounded-full bg-ink text-surface text-[13px] font-medium">Save profile</button>
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-line bg-surface p-6">
          <div className="text-[11px] tracking-widest uppercase text-ink-muted font-medium">Layer 3 · Post for today · {wordCount}w</div>
          {todaySlot ? (
            <div className="mt-3 rounded-[24px] border border-line bg-coral-soft p-5">
              <div className="text-[11px] tracking-widest uppercase text-coral-ink">Today · {todaySlot.date}</div>
              <div className="font-medium text-ink mt-1">{todaySlot.topic}</div>
              <div className="text-[13px] text-ink-muted mt-1">{todaySlot.angle} · {todaySlot.postType}</div>
              <button onClick={()=> generateForSlot(todaySlot)} className="mt-4 w-full h-9 rounded-full bg-ink text-surface text-[13px] font-medium inline-flex items-center justify-center gap-2"><Wand2 className="w-4 h-4"/>Generate {wordCount} words</button>
              <p className="text-[11px] text-ink-muted mt-3 text-center">Human story — relatable, concrete, WAT aware. Expands below.</p>
            </div>
          ) : (
            <div className="mt-3 rounded-[24px] border border-line bg-surface-flat p-4 text-[13px] text-ink-muted">No slot for today — generate a year calendar.</div>
          )}
          <div className="mt-4 rounded-[12px] border border-line bg-surface-flat p-4">
            <div className="text-[11px] tracking-widest uppercase text-ink-muted">Human-touch rules</div>
            <ul className="text-[12px] leading-5 mt-2 list-disc pl-4 text-ink">
              <li>Story over slogan — Lagos desk, real time</li>
              <li>Concrete details from profile/notes</li>
              <li>Vary length/structure/hook consecutively</li>
              <li>Flag posts needing confirmation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-line bg-surface p-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-4 h-4 text-ink-muted" />
          <h2 className="font-medium text-ink">Year calendar · themes only (editable slot by slot)</h2>
          <span className="text-[11px] tracking-widest uppercase text-ink-muted ml-auto">{visible.length} slots shown · {wordCount}w</span>
        </div>
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map(slot=>(
            <motion.div key={slot.id} layout className={`rounded-[12px] border p-4 flex flex-col gap-2 ${slot.locked ? "bg-ink text-surface border-ink" : "bg-surface border-line"} ${expandedSlot===slot.id ? "ring-2 ring-coral shadow-focused" : ""}`}>
              <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase">
                <span className={slot.locked?"text-surface":"text-ink-muted"}>{slot.date} · {slot.postType}</span>
                <button onClick={()=> setLinkedinCalendar(linkedinCalendar.map(s=> s.id===slot.id ? {...s, locked: !s.locked}: s))} className={`ml-auto w-6 h-6 rounded-full grid place-items-center border ${slot.locked?"bg-surface text-ink border-surface":"bg-surface-flat text-ink-muted border-line"}`}>
                  {slot.locked? <Lock className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>}
                </button>
              </div>
              <div className={`font-medium text-[13px] leading-5 ${slot.locked?"text-surface":"text-ink"}`}>{slot.topic}</div>
              <div className={`text-[12px] ${slot.locked?"text-surface":"text-ink-muted"}`}>{slot.angle}</div>
              <div className="flex gap-2 mt-2">
                <button onClick={()=> generateForSlot(slot)} className={`h-7 px-3 rounded-full text-[12px] font-medium inline-flex items-center gap-1 transition ${slot.locked?"bg-surface text-ink":"bg-ink text-surface hover:bg-black"}`}>Generate</button>
                <button onClick={()=>{ const nt = prompt("Edit topic", slot.topic); if(nt) setLinkedinCalendar(linkedinCalendar.map(s=> s.id===slot.id ? {...s, topic:nt}: s)); }} className={`h-7 px-3 rounded-full text-[12px] border ${slot.locked?"border-surface/20 text-surface":"border-line bg-surface text-ink"}`}>Edit</button>
              </div>
              {/* expandable inline preview for this slot */}
              <AnimatePresence>
                {expandedSlot===slot.id && generated?.slotId===slot.id && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
                    <div className="mt-3 rounded-[12px] bg-surface border border-line p-3">
                      <div className="text-[10px] tracking-widest uppercase text-ink-muted">Expanded — {generated.variants[0].split(/\s+/).length} words · human story</div>
                      <p className="text-[12px] leading-5 whitespace-pre-wrap mt-2 text-ink line-clamp-5">{generated.variants[0]}</p>
                      <button onClick={()=> document.getElementById("linkedin-generated")?.scrollIntoView({ behavior:"smooth" })} className="mt-2 text-[11px] text-coral-ink">View full →</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button onClick={()=>{ const n7= visible.slice(0,7); n7.forEach(s=> { const v=mockLinkedInPost(voiceProfile,s,"", wordCount); addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId:null, channel:"linkedin", body: v[0], status:"draft", createdAt:new Date().toISOString(), variants:v }); }); }} className="h-9 px-4 rounded-full bg-ink text-surface text-[13px] font-medium">Generate next 7 days · {wordCount}w</button>
          <button onClick={()=>{ const n30= visible.slice(0,30); n30.forEach(s=> { const v=mockLinkedInPost(voiceProfile,s,"", wordCount); addDraft({ id: Math.random().toString(36).slice(2,9), sourceNoteId:null, channel:"linkedin", body: v[0], status:"draft", createdAt:new Date().toISOString(), variants:v }); }); }} className="h-9 px-4 rounded-full border border-line bg-surface text-ink text-[13px] font-medium">Generate next 30 days</button>
        </div>
      </div>

      <AnimatePresence>
      {generated && (
        <motion.div id="linkedin-generated" initial={{ opacity:0, y:12, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }} className="rounded-[24px] border border-line bg-blue-soft p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-ink">Generated — pick a variant · {generated.variants[0]?.split(/\s+/).length || wordCount} words</h3>
              <p className="text-[11px] tracking-widest uppercase text-ink-muted mt-1">Post for {generated.slotId} · 2 variants · human, story-like, relatable · review before publishing</p>
            </div>
            <button onClick={()=> setGenerated(null)} className="h-7 px-3 rounded-full bg-surface border border-line text-[12px]">Close</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {generated.variants.map((v,i)=>(
              <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }} className="rounded-[24px] bg-surface border border-line p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="text-[11px] tracking-widest uppercase text-ink-muted">Variant {i+1} · {v.split(/\s+/).length} words</div>
                  <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-coral-soft text-coral-ink">{wordCount}w target</span>
                </div>
                <p className="text-[14px] leading-6 whitespace-pre-wrap mt-2 text-ink">{v}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=> saveDraftFromVariant(v)} className="h-8 px-3 rounded-full bg-ink text-surface text-[13px] font-medium inline-flex items-center gap-1"><Bookmark className="w-3.5 h-3.5"/>Save as draft</button>
                  <button onClick={()=> {navigator.clipboard.writeText(v); setCopyOk(v); setTimeout(()=> setCopyOk(null),1200);}} className="h-8 px-3 rounded-full border border-line bg-surface text-ink text-[13px] inline-flex items-center gap-1"><Copy className="w-3.5 h-3.5"/>{copyOk===v?"Copied":"Copy"}</button>
                </div>
                <div className="text-[11px] text-ink-muted mt-2">⚑ Flag: check that client story is accurate — human stories must be true.</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="rounded-[24px] border border-line bg-surface p-6">
        <h3 className="font-medium text-ink flex items-center gap-2"><Sparkles className="w-4 h-4 text-teal"/> Draft history · {drafts.filter(d=> d.channel==="linkedin").length} LinkedIn drafts</h3>
        <div className="mt-3 space-y-3">
          {drafts.filter(d=> d.channel==="linkedin").slice(0,6).map(d=>(
            <div key={d.id} className="rounded-[12px] border border-line bg-surface-flat p-4">
              <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-ink-muted"><span suppressHydrationWarning>{fmtLagosShort(d.createdAt)}</span><span className={`px-2 py-0.5 rounded-full border text-[11px] ${d.status==="posted"?"bg-ink text-surface border-ink": d.status==="ready"?"bg-coral-soft text-coral-ink border-coral/10":"bg-surface border-line text-ink"}`}>{d.status}</span></div>
              <p className="text-[13px] leading-5 whitespace-pre-wrap mt-2 text-ink">{d.body.slice(0,220)}…</p>
              <div className="flex gap-2 mt-3">
                <button onClick={()=> navigator.clipboard.writeText(d.body)} className="h-7 px-3 rounded-full border border-line bg-surface text-ink text-[12px]">Copy</button>
                <button onClick={()=> addDraft({...d, id: Math.random().toString(36).slice(2,9)})} className="h-7 px-3 rounded-full border border-line bg-surface text-ink text-[12px]">Duplicate</button>
              </div>
            </div>
          ))}
          {drafts.filter(d=> d.channel==="linkedin").length===0 && <p className="text-[13px] text-ink-muted">No drafts yet. Generate from a slot or turn a note into a post.</p>}
        </div>
      </div>
    </div>
  );
}
