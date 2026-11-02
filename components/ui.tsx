"use client";
import React from "react";

export function Pill({ children, variant="blue", className="" }: { children: React.ReactNode; variant?: "coral"|"blue"|"slate"; className?:string }){
  const map:any = {
    coral: "bg-coral-soft text-coral-ink border border-coral/10",
    blue: "bg-blue-soft text-blue-ink border border-blue-soft",
    slate: "bg-surface-flat text-ink-muted border border-line",
  };
  return <span className={`pill ${map[variant]} ${className}`}>{children}</span>;
}

export function TaskCard({ title, time, pills, focused=false, onClick, children }: { title:string; time?:string; pills?: React.ReactNode; focused?:boolean; onClick?:()=>void; children?: React.ReactNode }){
  return (
    <div onClick={onClick} className={`rounded-[24px] p-5 transition cursor-pointer ${focused ? "bg-surface shadow-focused border border-transparent" : "bg-surface-flat/60 border border-line"} `} style={focused? {boxShadow:"0 12px 32px rgba(74,117,137,0.18)"}:{}}>
      <div className="flex gap-2 flex-wrap">{pills}</div>
      <div className="text-[16px]/[24px] font-medium text-ink mt-3 line-clamp-2">{title}</div>
      {time && <div className="text-[12px]/[18px] text-ink-muted mt-2">{time}</div>}
      {children}
    </div>
  );
}

export function BottomSheet({ title, action, children }: { title:string; action?: React.ReactNode; children: React.ReactNode }){
  return (
    <div className="bg-bg rounded-t-[32px] shadow-sheet border-t border-line overflow-hidden">
      <div className="sheet-handle" />
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-[24px]/[32px] font-normal text-ink">{title}</h2>
        {action}
      </div>
      <div className="px-4 pb-6 space-y-4">
        {children}
      </div>
    </div>
  );
}

export function TealBand({ children }: { children: React.ReactNode }){
  return <div className="bg-teal text-on-teal rounded-b-[32px] px-6 py-6">{children}</div>;
}

export function IllustrationCard({ title, subtitle, imageAlt }: { title:string; subtitle?:string; imageAlt?:string }){
  return (
    <div className="relative">
      <div className="rounded-[24px] bg-blue-soft h-[180px] flex items-center justify-center overflow-hidden">
        {/* CSS placeholder for clay illustration */}
        <div className="w-20 h-20 rounded-full border-[10px] border-white/70 bg-surface shadow-sm flex items-center justify-center">
          <div className="w-8 h-8 rounded bg-teal/10" />
        </div>
        <div className="absolute top-6 right-10 w-10 h-10 rounded bg-coral/20 rotate-12" />
      </div>
      <div className="absolute -bottom-8 left-4 right-4 bg-surface rounded-[16px] p-4 shadow-focused border border-line flex flex-col gap-1">
        <div className="text-[14px] font-medium text-ink">{title}</div>
        {subtitle && <div className="text-[12px] text-ink-muted">{subtitle}</div>}
      </div>
    </div>
  );
}

export function Fab({ onClick, children }: { onClick?:()=>void; children?: React.ReactNode }){
  return (
    <button onClick={onClick} className="w-14 h-14 rounded-full bg-coral text-on-coral grid place-items-center shadow-fab active:scale-[0.94] transition" style={{ transitionDuration:"90ms" }}>
      {children}
    </button>
  );
}

export function Donut({ percent }: { percent:number }){
  const r= 42, c= 2*Math.PI*r, offset = c - (percent/100)*c;
  return (
    <div className="flex items-center gap-4">
      <svg width={96} height={96} viewBox="0 0 96 96" className="shrink-0">
        <circle cx={48} cy={48} r={r} stroke="var(--line)" strokeWidth={12} fill="none" />
        <circle cx={48} cy={48} r={r} stroke="var(--coral)" strokeWidth={12} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 48 48)" style={{ transition:"stroke-dashoffset 800ms var(--ease-out)" }} />
      </svg>
      <div>
        <div className="text-[44px]/[48px] font-light text-ink">{percent}%</div>
        <div className="text-[12px] text-ink-muted">Completed</div>
      </div>
    </div>
  );
}

export function BarChart({ values, selectedIdx=0 }: { values:number[]; selectedIdx?:number }){
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-2 h-[120px] px-2">
      {values.map((v,i)=>(
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className={`w-full rounded-[8px] transition-all ${i===selectedIdx?"bg-coral":"bg-blue-soft"}`} style={{ height: `${(v/max)*80 + 16}px` }} />
          <span className="text-[11px] text-ink-muted">{["M","T","W","T","F","S","S"][i%7]}</span>
        </div>
      ))}
    </div>
  );
}

export function GlassPill({ children }: { children: React.ReactNode }){
  return <div className="glass rounded-full px-4 py-3 flex items-center gap-3">{children}</div>;
}
