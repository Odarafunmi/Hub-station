"use client";
import { useStore } from "@/lib/store";
import { mockWeeklyInstagramIdeas, mockYearlyCalendar } from "@/lib/mockAI";
import { Image as ImageIcon, Sparkles, Hash, Layers, Target, Bookmark, Copy, Play, Grid3X3, CalendarDays, Wand2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

const pillarsInfo = [
  { key:"showcase", label:"Showcase", desc:"Finished work + problem/result story", color:"#E4405F" },
  { key:"process", label:"Process", desc:"Sketches, iterations, before/after", color:"#4A8FA8" },
  { key:"education", label:"Education", desc:"Carousels on principles & mistakes", color:"#7C3AED" },
  { key:"client", label:"Client attraction", desc:"Offers, testimonials, FAQs", color:"#E8A10C" },
  { key:"personality", label:"Personality", desc:"Studio life, psychology angle", color:"#0F172A" },
];

export default function InstagramPage(){
  const { instagramCalendar, setInstagramCalendar, instagramPillars, setInstagramPillars } = useStore();
  const [weekly, setWeekly] = useState<any[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<string|null>(null);

  if(instagramCalendar.length===0){
    // seed
  }

  const generatePlan = ()=>{
    const plan = mockYearlyCalendar("instagram").slice(0,52);
    setInstagramCalendar(plan);
    setWeekly(mockWeeklyInstagramIdeas());
  };

  const generateWeek = ()=>{
    setWeekly(mockWeeklyInstagramIdeas());
  };

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[28px] tracking-tight leading-none">Instagram strategy</h1>
          <p className="text-[14px] text-ink-soft mt-2 max-w-[60ch]">For two audiences: design peers who follow for craft, and prospective clients who buy. Plans adapt monthly with what performed.</p>
        </div>
        <button onClick={generatePlan} className="h-9 px-4 rounded-full bg-ink text-white text-[13px] font-semibold inline-flex items-center gap-2"><Wand2 className="w-4 h-4"/> Create 12-month plan</button>
      </div>

      {/* Pillars */}
      <div className="rounded-card border border-border bg-white p-5">
        <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-ink-muted"/><h2 className="font-display font-semibold">Content pillars (editable)</h2><span className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted ml-auto">One takeaway per carousel · Hashtag bank per pillar</span></div>
        <div className="grid md:grid-cols-5 gap-3 mt-4">
          {pillarsInfo.map(p=>(
            <button key={p.key} onClick={()=> setSelectedPillar(selectedPillar===p.key ? null : p.key)} className={`rounded-card border p-4 text-left transition ${selectedPillar===p.key?"border-ink bg-ink text-white":"bg-white border-border hover:border-border-strong"}`}>
              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <div className="font-display font-semibold text-[14px] mt-2">{p.label}</div>
              <div className={`text-[12px] leading-4 mt-1 ${selectedPillar===p.key?"text-white/70":"text-ink-soft"}`}>{p.desc}</div>
              <div className={`mono text-[10px] tracking-[0.08em] uppercase mt-3 px-2 py-1 rounded-full border inline-block ${selectedPillar===p.key?"border-white/20 text-white":"border-border bg-surface-2 text-ink-muted"}`}>Active</div>
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <div className="rounded-control border border-border bg-surface-2 p-3">
            <div className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">Services offered</div>
            <div className="text-[13px] mt-1">{instagramPillars?.services || "Branding, print, editorial, social"}</div>
          </div>
          <div className="rounded-control border border-border bg-surface-2 p-3">
            <div className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">Goals (ranked)</div>
            <div className="text-[13px] mt-1">{instagramPillars?.goals || "Inquiries > authority > followers"}</div>
          </div>
          <div className="rounded-control border border-border bg-surface-2 p-3">
            <div className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">Monthly focus</div>
            <div className="text-[13px] mt-1">{instagramPillars?.monthlyFocus || "Clarity in proposals"}</div>
          </div>
        </div>
      </div>

      {/* 12 month plan */}
      <div className="rounded-card border border-border bg-white p-5">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-4 h-4 text-ink-muted" />
          <h2 className="font-display font-semibold">12-month strategy</h2>
          <span className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted ml-auto">Monthly focus · weekly rhythm · pillar mix · formats (single, carousel, reel)</span>
        </div>

        {instagramCalendar.length===0 ? (
          <div className="mt-6 rounded-card border border-dashed border-border-strong bg-surface-2/50 p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-white border border-border grid place-items-center mx-auto"><Grid3X3 className="w-5 h-5 text-ink-muted"/></div>
            <p className="font-display font-semibold mt-3">No plan yet</p>
            <p className="text-[13px] text-ink-soft">Create a 12-month plan in one session. Each week holds topic + pillar + format.</p>
            <button onClick={generatePlan} className="mt-3 h-9 px-4 rounded-full bg-ink text-white text-[13px] font-semibold">Generate plan</button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {months.map((m,i)=> {
                const slot = instagramCalendar[i*4] || instagramCalendar[i] || { topic: "Clarity week", angle:"Education: proposal clarity" };
                return (
                  <div key={m} className="rounded-card border border-border bg-surface-2/40 p-3">
                    <div className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">{String(i+1).padStart(2,"0")} · {m.toUpperCase()}</div>
                    <div className="font-medium text-[13px] mt-1">{slot.topic || "Client attraction: how to brief"}</div>
                    <div className="text-[12px] text-ink-soft mt-1">{slot.angle || "Showcase: brand turnaround"}</div>
                    <div className="flex gap-1 mt-2">
                      <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-white border border-border">carousel</span>
                      <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-white border border-border">single</span>
                      <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-white border border-border">reel</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={generateWeek} className="mt-4 h-9 px-4 rounded-full bg-amber-500 text-white text-[13px] font-semibold inline-flex items-center gap-2"><Sparkles className="w-4 h-4"/>Generate a week of ideas (under 60s)</button>
          </>
        )}
      </div>

      {/* Weekly ideas */}
      {weekly.length>0 && (
        <div className="rounded-card border border-border bg-white p-5">
          <h3 className="font-display font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500"/> Week ideas — save to calendar</h3>
          <div className="mt-4 space-y-3">
            {weekly.map((w,i)=>(
              <div key={i} className="rounded-card border border-border bg-surface-2/40 p-4 flex gap-4">
                <div className="w-10 h-10 rounded-card bg-white border border-border grid place-items-center shrink-0">
                  {w.format==="carousel" ? <Layers className="w-5 h-5 text-ink-muted"/> : w.format==="reel" ? <Play className="w-5 h-5 text-ink-muted"/> : <ImageIcon className="w-5 h-5 text-ink-muted"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono text-[11px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full bg-white border border-border">{w.pillar}</span>
                    <span className="mono text-[11px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full bg-ink text-white">{w.format}</span>
                    <span className="mono text-[11px] text-ink-muted">Takeaway: {w.idea}</span>
                  </div>
                  <div className="font-medium text-[14px] mt-1">{w.hook}</div>
                  <div className="text-[13px] text-ink-soft mt-1">{w.caption || w.idea}</div>
                  <div className="flex gap-2 mt-2">
                    <button className="h-7 px-3 rounded-full bg-ink text-white text-[12px] inline-flex items-center gap-1"><Bookmark className="w-3 h-3"/>Save</button>
                    <button className="h-7 px-3 rounded-full border border-border bg-white text-[12px] inline-flex items-center gap-1"><Copy className="w-3 h-3"/>Caption</button>
                    <span className="mono text-[11px] text-ink-muted self-center">Visual: {w.idea.slice(0,32)}…</span>
                  </div>
                </div>
                <div className="hidden md:block w-[84px] h-[84px] rounded-card bg-white border border-border overflow-hidden shrink-0">
                  <div className="w-full h-full grid place-items-center bg-gradient-to-br from-tide-50 to-amber-50 text-ink-muted mono text-[10px] p-2 text-center">Slide 1<br/>Hook + image</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-control border border-border bg-surface-2 p-3 flex items-center gap-2 mono text-[11px]">
            <Hash className="w-4 h-4 text-ink-muted"/> Hashtag bank per pillar: #BrandDesign #ClientExperience #ProposalTips #UneekDesigns #Editorial #Print
            <span className="ml-auto">Export or view by month</span>
          </div>
        </div>
      )}

      {/* Carousel outline example */}
      <div className="rounded-card border border-border bg-white p-5">
        <h3 className="font-display font-semibold">Carousel outlines · slide-by-slide, ready to design</h3>
        <p className="text-[13px] text-ink-soft mt-1">Each idea names the one takeaway. Educational claims are flagged for accuracy check.</p>
        <div className="mt-4 grid md:grid-cols-6 gap-2">
          {[1,2,3,4,5,6].map(n=>(
            <div key={n} className="rounded-card border border-border bg-surface-2 overflow-hidden">
              <div className="h-[96px] bg-white border-b border-border grid place-items-center p-2 text-center">
                <div className="w-8 h-8 rounded-full bg-tide-500 text-white grid place-items-center mono text-[11px] font-bold">{n}</div>
                <div className="mono text-[10px] text-ink-muted mt-1">Slide {n}</div>
              </div>
              <div className="p-2">
                <div className="text-[11px] font-medium leading-4">{n===1?"Why clients go quiet after a quote": n===6?"Save this for your next proposal →": `Reason ${n-1}: fix inside`}</div>
                <div className="mono text-[10px] text-ink-muted mt-1">Tide bg · large type</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 mono text-[11px] text-ink-muted">Caption: Proposal silence is rarely about money — it's about clarity. · ⚑ Educational content flagged: confirm anchoring definition.</div>
      </div>
    </div>
  );
}
