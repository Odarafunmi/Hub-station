"use client";
import { useStore } from "@/lib/store";
import { mockWeeklyInstagramIdeas, mockYearlyCalendar } from "@/lib/mockAI";
import { Image as ImageIcon, Sparkles, Hash, Layers, Bookmark, Copy, Play, Grid3X3, CalendarDays, Wand2 } from "lucide-react";
import { useState } from "react";

const pillarsInfo = [
  { key:"showcase", label:"Showcase", desc:"Finished work + problem/result story", color:"#E4405F" },
  { key:"process", label:"Process", desc:"Sketches, iterations, before/after", color:"#4A7589" },
  { key:"education", label:"Education", desc:"Carousels on principles & mistakes", color:"#7C3AED" },
  { key:"client", label:"Client attraction", desc:"Offers, testimonials, FAQs", color:"#E8643A" },
  { key:"personality", label:"Personality", desc:"Studio life, psychology angle", color:"#16202E" },
];

export default function InstagramPage(){
  const { instagramCalendar, setInstagramCalendar } = useStore();
  const [weekly, setWeekly] = useState<any[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<string|null>(null);
  const generatePlan = ()=>{
    const plan = mockYearlyCalendar("instagram").slice(0,52);
    setInstagramCalendar(plan);
    setWeekly(mockWeeklyInstagramIdeas());
  };
  const generateWeek = ()=> setWeekly(mockWeeklyInstagramIdeas());
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-normal text-ink tracking-tight leading-none">Instagram strategy</h1>
          <p className="text-[14px] text-ink-muted mt-2 max-w-[60ch]">For two audiences: design peers who follow for craft, and prospective clients who buy. Plans adapt monthly with what performed.</p>
        </div>
        <button onClick={generatePlan} className="h-9 px-4 rounded-full bg-ink text-surface text-[13px] font-medium inline-flex items-center gap-2"><Wand2 className="w-4 h-4"/> Create 12-month plan</button>
      </div>

      <div className="rounded-[24px] border border-line bg-surface p-6">
        <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-ink-muted"/><h2 className="font-medium text-ink">Content pillars (editable)</h2><span className="text-[11px] tracking-widest uppercase text-ink-muted ml-auto">One takeaway per carousel · Hashtag bank per pillar</span></div>
        <div className="grid md:grid-cols-5 gap-3 mt-4">
          {pillarsInfo.map(p=>(
            <button key={p.key} onClick={()=> setSelectedPillar(selectedPillar===p.key ? null : p.key)} className={`rounded-[24px] border p-5 text-left transition ${selectedPillar===p.key?"bg-ink text-surface border-ink":"bg-surface border-line hover:border-ink/20"}`}>
              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <div className="font-medium text-[14px] mt-3 text-ink" style={selectedPillar===p.key? {color:"var(--surface)"}:{}}>{p.label}</div>
              <div className="text-[12px] leading-4 mt-1" style={selectedPillar===p.key? {color:"var(--surface)"}:{color:"var(--ink-muted)"}}>{p.desc}</div>
              <div className={`text-[10px] tracking-widest uppercase mt-3 px-2.5 py-1 rounded-full border inline-block ${selectedPillar===p.key?"bg-surface text-ink border-surface":"bg-surface-flat text-ink-muted border-line"}`}>Active</div>
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <div className="rounded-[12px] border border-line bg-surface-flat p-4">
            <div className="text-[11px] tracking-widest uppercase text-ink-muted">Services offered</div>
            <div className="text-[13px] mt-1 text-ink">Branding, print, editorial, social</div>
          </div>
          <div className="rounded-[12px] border border-line bg-surface-flat p-4">
            <div className="text-[11px] tracking-widest uppercase text-ink-muted">Goals (ranked)</div>
            <div className="text-[13px] mt-1 text-ink">Inquiries &gt; authority &gt; followers</div>
          </div>
          <div className="rounded-[12px] border border-line bg-surface-flat p-4">
            <div className="text-[11px] tracking-widest uppercase text-ink-muted">Monthly focus</div>
            <div className="text-[13px] mt-1 text-ink">Clarity in proposals</div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-line bg-surface p-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-4 h-4 text-ink-muted" />
          <h2 className="font-medium text-ink">12-month strategy</h2>
          <span className="text-[11px] tracking-widest uppercase text-ink-muted ml-auto">Monthly focus · weekly rhythm · pillar mix · formats</span>
        </div>
        {instagramCalendar.length===0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-line bg-surface-flat p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-surface border border-line grid place-items-center mx-auto"><Grid3X3 className="w-5 h-5 text-ink-muted"/></div>
            <p className="font-medium text-ink mt-3">No plan yet</p>
            <p className="text-[13px] text-ink-muted">Create a 12-month plan in one session. Each week holds topic + pillar + format.</p>
            <button onClick={generatePlan} className="mt-3 h-9 px-4 rounded-full bg-ink text-surface text-[13px] font-medium">Generate plan</button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {months.map((m,i)=> {
                const slot = instagramCalendar[i*4] || instagramCalendar[i] || { topic: "Clarity week", angle:"Education: proposal clarity" };
                return (
                  <div key={m} className="rounded-[24px] border border-line bg-surface-flat p-4">
                    <div className="text-[11px] tracking-widest uppercase text-ink-muted">{String(i+1).padStart(2,"0")} · {m.toUpperCase()}</div>
                    <div className="font-medium text-[13px] mt-2 text-ink">{slot.topic || "Client attraction: how to brief"}</div>
                    <div className="text-[12px] text-ink-muted mt-1">{slot.angle || "Showcase: brand turnaround"}</div>
                    <div className="flex gap-1 mt-3">
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-surface border border-line text-ink">carousel</span>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-surface border border-line text-ink">single</span>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-surface border border-line text-ink">reel</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={generateWeek} className="mt-4 h-9 px-4 rounded-full bg-coral text-on-coral text-[13px] font-medium inline-flex items-center gap-2"><Sparkles className="w-4 h-4"/>Generate a week of ideas</button>
          </>
        )}
      </div>

      {weekly.length>0 && (
        <div className="rounded-[24px] border border-line bg-surface p-6">
          <h3 className="font-medium text-ink flex items-center gap-2"><Sparkles className="w-4 h-4 text-coral"/> Week ideas — save to calendar</h3>
          <div className="mt-4 space-y-3">
            {weekly.map((w,i)=>(
              <div key={i} className="rounded-[24px] border border-line bg-surface-flat p-5 flex gap-4">
                <div className="w-10 h-10 rounded-[12px] bg-surface border border-line grid place-items-center shrink-0">
                  {w.format==="carousel" ? <Layers className="w-5 h-5 text-ink-muted"/> : w.format==="reel" ? <Play className="w-5 h-5 text-ink-muted"/> : <ImageIcon className="w-5 h-5 text-ink-muted"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-surface border border-line text-ink">{w.pillar}</span>
                    <span className="text-[11px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-ink text-surface">{w.format}</span>
                    <span className="text-[11px] text-ink-muted">Takeaway: {w.idea}</span>
                  </div>
                  <div className="font-medium text-[14px] mt-2 text-ink">{w.hook}</div>
                  <div className="text-[13px] text-ink-muted mt-1">{w.caption || w.idea}</div>
                  <div className="flex gap-2 mt-3">
                    <button className="h-7 px-3 rounded-full bg-ink text-surface text-[12px] inline-flex items-center gap-1"><Bookmark className="w-3 h-3"/>Save</button>
                    <button className="h-7 px-3 rounded-full border border-line bg-surface text-ink text-[12px] inline-flex items-center gap-1"><Copy className="w-3 h-3"/>Caption</button>
                    <span className="text-[11px] text-ink-muted self-center">Visual: {w.idea.slice(0,32)}…</span>
                  </div>
                </div>
                <div className="hidden md:block w-[84px] h-[84px] rounded-[24px] bg-surface border border-line overflow-hidden shrink-0">
                  <div className="w-full h-full grid place-items-center bg-blue-soft text-ink-muted text-[10px] p-2 text-center">Slide 1<br/>Hook + image</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[12px] border border-line bg-surface-flat p-3 flex items-center gap-2 text-[11px] text-ink">
            <Hash className="w-4 h-4 text-ink-muted"/> Hashtag bank: #BrandDesign #ClientExperience #UneekDesigns
            <span className="ml-auto text-ink-muted">Export or view by month</span>
          </div>
        </div>
      )}

      <div className="rounded-[24px] border border-line bg-surface p-6">
        <h3 className="font-medium text-ink">Carousel outlines · slide-by-slide, ready to design</h3>
        <p className="text-[13px] text-ink-muted mt-1">Each idea names the one takeaway. Educational claims are flagged for accuracy check.</p>
        <div className="mt-4 grid md:grid-cols-6 gap-2">
          {[1,2,3,4,5,6].map(n=>(
            <div key={n} className="rounded-[24px] border border-line bg-surface-flat overflow-hidden">
              <div className="h-[96px] bg-surface border-b border-line grid place-items-center p-2 text-center">
                <div className="w-8 h-8 rounded-full bg-teal text-on-teal grid place-items-center text-[11px] font-medium">{n}</div>
                <div className="text-[10px] text-ink-muted mt-1">Slide {n}</div>
              </div>
              <div className="p-3">
                <div className="text-[11px] font-medium text-ink leading-4">{n===1?"Why clients go quiet after a quote": n===6?"Save this for your next proposal →": `Reason ${n-1}: fix inside`}</div>
                <div className="text-[10px] text-ink-muted mt-1">Large type</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-ink-muted">Caption: Proposal silence is rarely about money — it's about clarity. · <span className="text-coral-ink bg-coral-soft px-2 py-0.5 rounded-full">⚑ Confirm anchoring definition</span></div>
      </div>
    </div>
  );
}
