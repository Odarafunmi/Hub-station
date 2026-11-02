"use client";
import { useStore } from "@/lib/store";
import { Pill, TaskCard, Donut, BarChart } from "@/components/ui";
import { isPast, addMinutes, addHours, addDays } from "date-fns";
import { Check, Clock, Plus, Trash2, ChevronDown, ChevronRight, Sparkles, Mic, Square } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceTranscription } from "@/lib/useVoice";

function fmt(dateStr?:string){
  if(!dateStr) return "—";
  const d = new Date(dateStr);
  const day = new Intl.DateTimeFormat("en-GB",{ day:"numeric", month:"short", timeZone:"Africa/Lagos"}).format(d);
  const time = new Intl.DateTimeFormat("en-US",{ hour:"numeric", minute:"2-digit", hour12:true, timeZone:"Africa/Lagos"}).format(d);
  return `${day} · ${time}`;
}

// Alarm-style wheel picker (AM/PM, Nigerian 12h)
function WheelTimePicker({ hour, minute, period, onChange }: { hour:number; minute:number; period:"AM"|"PM"; onChange:(h:number,m:number,p:"AM"|"PM")=>void }) {
  const hours = Array.from({length:12},(_,i)=> i+1);
  const minutes = Array.from({length:60},(_,i)=> i);
  // refs for snap
  return (
    <div className="rounded-[24px] border border-line bg-surface-flat p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-teal"/>
        <span className="text-[11px] tracking-widest uppercase text-ink-muted font-medium">Pick time — Lagos (WAT)</span>
        <span className="ml-auto text-[13px] font-medium text-ink tabular-nums">{String(hour).padStart(2,"0")}:{String(minute).padStart(2,"0")} {period}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 bg-surface rounded-[16px] border border-line p-2 h-[160px]">
        {/* Hour */}
        <div className="overflow-auto snap-y snap-mandatory rounded-[12px] border border-line bg-surface-flat/50" style={{ scrollbarWidth:"none" }}>
          <div className="py-8">
            {hours.map(h=>(
              <button key={h} onClick={()=> onChange(h, minute, period)} className={`w-full h-10 snap-center text-[14px] font-medium grid place-items-center rounded-[12px] ${h===hour ? "bg-ink text-surface shadow-sm" : "text-ink hover:bg-surface"}`}>{String(h).padStart(2,"0")}</button>
            ))}
          </div>
        </div>
        {/* Minute */}
        <div className="overflow-auto snap-y snap-mandatory rounded-[12px] border border-line bg-surface-flat/50" style={{ scrollbarWidth:"none" }}>
          <div className="py-8">
            {minutes.map(m=>(
              <button key={m} onClick={()=> onChange(hour, m, period)} className={`w-full h-8 snap-center text-[13px] grid place-items-center rounded-[12px] ${m===minute ? "bg-ink text-surface" : "text-ink-muted hover:bg-surface"}`}>{String(m).padStart(2,"0")}</button>
            ))}
          </div>
        </div>
        {/* Period */}
        <div className="flex flex-col gap-2 p-2">
          {(["AM","PM"] as const).map(p=>(
            <button key={p} onClick={()=> onChange(hour, minute, p)} className={`flex-1 rounded-[12px] border text-[13px] font-medium ${p===period ? "bg-coral text-on-coral border-coral shadow-sm" : "bg-surface border-line text-ink-muted"}`}>{p}</button>
          ))}
          <div className="text-[10px] text-ink-muted text-center leading-3">Scroll hour/minute<br/>like alarm</div>
        </div>
      </div>
      <div className="text-[11px] text-ink-muted mt-2 text-center">Works for Today / Tomorrow / Custom — exact WAT time saved</div>
    </div>
  );
}

function to24Hour(hour:number, period:"AM"|"PM"){
  if(period==="AM") return hour===12 ? 0 : hour;
  return hour===12 ? 12 : hour+12;
}

export default function TodoPage(){
  const { todos, addTodo, updateTodo, deleteTodo } = useStore();
  const [tab, setTab] = useState<"today"|"upcoming"|"overdue"|"done">("today");
  const [showMissed, setShowMissed] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dueTab, setDueTab] = useState<"Today"|"Tomorrow"|"Custom">("Today");
  const [category, setCategory] = useState("Design");
  const [customDate, setCustomDate] = useState(""); // YYYY-MM-DD
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<"AM"|"PM">("AM");
  const voice = useVoiceTranscription();
  const [todoToast, setTodoToast] = useState<string | null>(null);

  const lists = useMemo(()=>{
    const open = todos.filter(t=> t.status==="open");
    const done = todos.filter(t=> t.status==="done");
    const todayLagos = new Date().toLocaleDateString("en-GB",{ timeZone:"Africa/Lagos"});
    const today = open.filter(t=> t.dueAt && new Date(t.dueAt).toLocaleDateString("en-GB",{timeZone:"Africa/Lagos"})===todayLagos);
    const overdue = open.filter(t=> t.dueAt && isPast(new Date(t.dueAt)) && new Date(t.dueAt).toLocaleDateString("en-GB",{timeZone:"Africa/Lagos"})!==todayLagos);
    const upcoming = open.filter(t=> !today.includes(t as any) && !overdue.includes(t as any));
    return { today, upcoming, overdue, done, open };
  },[todos]);

  const current = tab==="today"? lists.today : tab==="upcoming"? lists.upcoming : tab==="overdue"? lists.overdue : lists.done;

  const buildDueAt = () => {
    const h24 = to24Hour(hour, period);
    let base = new Date();
    if(dueTab==="Today"){
      base.setHours(h24, minute, 0, 0);
    } else if(dueTab==="Tomorrow"){
      base.setDate(base.getDate()+1);
      base.setHours(h24, minute, 0, 0);
    } else {
      if(!customDate) return undefined;
      const [y,m,d] = customDate.split("-").map(Number);
      base = new Date(y, m-1, d, h24, minute, 0, 0);
    }
    // store as UTC ISO but Lagos wall time preserved via local constructor then toISOString
    return base.toISOString();
  };

  const create = ()=>{
    // voice transcript counts as title too
    let finalTitle = title.trim();
    if (!finalTitle && voice.transcript) finalTitle = voice.transcript.trim();
    if (voice.state==="recording") {
      const t = voice.stop();
      if (t) finalTitle = (finalTitle ? finalTitle + " " : "") + t;
    }
    if(!finalTitle) return;
    const dueAt = buildDueAt();
    addTodo({ id: Math.random().toString(36).slice(2,9), title: finalTitle, notes:"", dueAt, remindAt: dueAt?[dueAt]:[], priority:"med", status:"open", repeat:"none", tags:[category], createdAt: new Date().toISOString() });
    setTitle(""); voice.reset(); setShowAdd(false);
    setTodoToast("Task added"); setTimeout(()=> setTodoToast(null), 1800);
  };

  const handleVoiceTodo = () => {
    if (voice.state==="recording") {
      const t = voice.stop();
      if(t){
        const dueAt = buildDueAt();
        addTodo({ id: Math.random().toString(36).slice(2,9), title: t.slice(0,80) || "Voice task", notes: t, dueAt, remindAt: dueAt?[dueAt]:[], priority:"med", status:"open", repeat:"none", tags:[category], createdAt: new Date().toISOString() });
        setTodoToast("Voice task added ✓");
        setTimeout(()=> setTodoToast(null), 2000);
        voice.reset();
      }
    } else {
      voice.start();
    }
  };

  const snooze = (id:string, mins:number)=>{
    const until = mins===1440 ? addDays(new Date(),1).toISOString() : mins===60 ? addHours(new Date(),1).toISOString() : addMinutes(new Date(), mins).toISOString();
    updateTodo(id, (x)=> ({...x, snoozedUntil: until, dueAt: until, remindAt: [until]}));
  };

  return (
    <div className="space-y-6 max-w-[640px] mx-auto lg:max-w-none">
      {/* Missed Tasks */}
      <div className="relative">
        <motion.div
          layout
          className={`rounded-[24px] bg-teal-mid text-on-teal overflow-hidden ${showMissed?"":"h-[44px]"}`}
          initial={false}
          animate={{ height: showMissed ? "auto" : 44 }}
          transition={{ duration:0.45, ease:[0.22,1,0.36,1] }}
        >
          <button onClick={()=> setShowMissed(!showMissed)} className="w-full flex items-center justify-between px-6 h-[44px]">
            <span className="text-[14px] font-medium text-on-teal">Missed Tasks</span>
            <span className="flex items-center gap-2 text-[12px] font-medium" style={{ color:"var(--on-teal)" }}>{lists.overdue.length} <motion.span animate={{ rotate: showMissed?180:0 }} transition={{ duration:0.28 }}><ChevronDown className="w-4 h-4"/></motion.span></span>
          </button>
          <AnimatePresence>
            {showMissed && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="px-4 pb-4 space-y-2">
                {lists.overdue.length===0 ? <p className="text-[13px] px-2" style={{ color:"var(--on-teal)" }}>No missed tasks — calm.</p> :
                  lists.overdue.map(t=>(
                    <motion.div key={t.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.04 }} className="bg-white/15 rounded-[16px] px-4 py-3 flex items-center gap-3 border border-white/10">
                      <span className="text-[13px] flex-1" style={{ color:"var(--on-teal)" }}>{t.title}</span>
                      <span className="text-[12px]" style={{ color:"var(--on-teal)" }}>{t.dueAt ? fmt(t.dueAt) : ""}</span>
                      <button onClick={()=> updateTodo(t.id, x=> ({...x, status:"done"}))} className="w-8 h-8 rounded-full bg-surface text-teal grid place-items-center"><Check className="w-4 h-4"/></button>
                    </motion.div>
                  ))
                }
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Active Tasks sheet */}
        <motion.div layout className="mt-3 bg-bg rounded-t-[32px] shadow-sheet border border-line overflow-hidden">
          <div className="sheet-handle" />
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-[24px]/[32px] font-normal text-ink">Active Tasks</h2>
            <button onClick={()=> setTab(tab==="today"?"upcoming":"today")} className="text-[13px] font-medium text-teal flex items-center gap-1">View list <ChevronRight className="w-4 h-4"/></button>
          </div>

          <div className="px-6 flex gap-4 border-b border-line relative">
            {["today","upcoming","overdue","done"].map(k=>{
              const active = tab===k;
              const counts:any = { today: lists.today.length, upcoming: lists.upcoming.length, overdue: lists.overdue.length, done: lists.done.length };
              return (
                <button key={k} onClick={()=> setTab(k as any)} className={`pb-3 text-[13px] font-medium relative ${active?"text-ink":"text-ink-muted"}`}>
                  <span className="capitalize">{k}</span> <span className="ml-1 text-[11px]">{counts[k]}</span>
                  {active && <motion.div layoutId="coral-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-coral rounded-full" transition={{ type:"spring", stiffness:400, damping:30 }}/>}
                </button>
              );
            })}
          </div>

          <div className="px-4 py-4 space-y-4">
            {current.length===0 ? (
              <div className="rounded-[24px] border border-dashed border-line bg-surface-flat/40 p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-soft grid place-items-center mx-auto">
                  <Sparkles className="w-5 h-5 text-blue-ink"/>
                </div>
                <p className="text-[14px] font-medium mt-3">No tasks in {tab}</p>
                <p className="text-[13px] text-ink-muted mt-1">Tap + to add one. Try voice mic to dictate a task.</p>
              </div>
            ) : current.map((t,i)=> (
              <motion.div key={t.id} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}>
                <TaskCard
                  title={t.title}
                  time={t.dueAt ? `Due ${fmt(t.dueAt)}` : undefined}
                  pills={<><Pill variant={t.priority==="high"?"coral":"blue"}>{t.tags?.[0] || "Design"}</Pill>{t.repeat!=="none" && <Pill variant="slate">{t.repeat}</Pill>}</>}
                  focused={i===0}
                  onClick={()=> updateTodo(t.id, x=> ({...x, status: x.status==="done"?"open":"done"}))}
                >
                  <div className="flex gap-2 mt-3">
                    <button onClick={(e)=>{e.stopPropagation(); snooze(t.id,10)}} className="h-7 px-3 rounded-full bg-surface border border-line text-[12px]">10m</button>
                    <button onClick={(e)=>{e.stopPropagation(); snooze(t.id,60)}} className="h-7 px-3 rounded-full bg-surface border border-line text-[12px]">1h</button>
                    <button onClick={(e)=>{e.stopPropagation(); updateTodo(t.id, x=> ({...x, status:"done"}))}} className="ml-auto w-7 h-7 rounded-full bg-ink text-surface grid place-items-center"><Check className="w-4 h-4"/></button>
                    <button onClick={(e)=>{e.stopPropagation(); deleteTodo(t.id)}} className="w-7 h-7 rounded-full border border-line grid place-items-center text-ink-muted"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </TaskCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stat cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-[24px] bg-surface border border-line p-6">
          <div className="text-[12px] text-ink-muted">Task progress</div>
          <Donut percent={62} />
          <div className="flex gap-2 mt-4">
            <span className="flex items-center gap-1.5 text-[12px]"><span className="w-2 h-2 rounded-full bg-coral"/>Completed</span>
            <span className="flex items-center gap-1.5 text-[12px]"><span className="w-2 h-2 rounded-full bg-[#B9D6EC]"/>Ongoing</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-line">
            <div><div className="text-[12px] text-ink-muted">Completed</div><div className="text-[15px] font-medium">18 tasks</div></div>
            <div><div className="text-[12px] text-ink-muted">Duration</div><div className="text-[15px] font-medium">34 hours</div></div>
          </div>
        </div>
        <div className="rounded-[24px] bg-surface border border-line p-6">
          <div className="text-[12px] text-ink-muted">Tasks per weekday</div>
          <div className="mt-4"><BarChart values={[2,3,4,3,5,2,1]} selectedIdx={2}/></div>
          <div className="mt-2 text-[12px] text-center text-ink-muted">4 Tasks on Wed</div>
        </div>
      </div>

      <p className="text-[12px] text-ink-muted text-center">Stacked layers are scaled 0.96 and blurred so the front sheet reads closest. Motion respects reduced-motion.</p>

      {/* Add sheet */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-40" onClick={()=> setShowAdd(false)} />
            <motion.div
              initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ duration:0.36, ease:[0.22,1,0.36,1] }}
              className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-[32px] shadow-sheet max-h-[90vh] overflow-auto"
              style={{ paddingBottom:"env(safe-area-inset-bottom)" }}
            >
              <div className="sheet-handle" />
              <div className="px-6 py-4 flex items-center justify-between">
                <h3 className="text-[20px] font-normal text-ink">Add a Task</h3>
                <button onClick={()=> setShowAdd(false)} className="w-8 h-8 rounded-full bg-surface-flat grid place-items-center">✕</button>
              </div>
              <div className="px-6 pb-6 space-y-6">
                <div>
                  <label className="text-[12px] text-ink-muted">Task title — type or speak</label>
                  <div className="relative mt-1">
                    <input value={voice.state==="recording" ? title + (voice.transcript ? " " + voice.transcript : "") + (voice.interimText ? " "+voice.interimText : "") : title} onChange={e=> {
                      if(voice.state==="recording") {
                        // allow edit while recording pauses capture
                      }
                      setTitle(e.target.value);
                    }} placeholder="e.g. Draft LinkedIn post — or tap mic to dictate" className="w-full border-0 border-b border-line focus:border-coral outline-none py-2 pr-10 text-[15px] bg-transparent placeholder:text-ink-muted" style={{ color:"var(--ink)" }} autoFocus />
                    <span className="absolute right-0 top-2 text-[11px] text-ink-muted">{voice.state==="recording" ? "● Live" : ""}</span>
                  </div>
                  {voice.transcript && <div className="text-[12px] text-teal mt-1">Heard: {voice.transcript.slice(0,90)}</div>}
                </div>
                <div>
                  <label className="text-[12px] text-ink-muted">Due to</label>
                  <div className="flex gap-6 mt-2 border-b border-line">
                    {(["Today","Tomorrow","Custom"] as const).map(tab=>{
                      const active = dueTab===tab;
                      return (
                        <button key={tab} onClick={()=> setDueTab(tab)} className={`pb-2 text-[14px] relative ${active?"text-ink":"text-ink-muted"}`}>
                          {tab}
                          {active && <motion.div layoutId="due-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-coral rounded-full"/>}
                        </button>
                      );
                    })}
                  </div>
                  {/* Time picker for all tabs */}
                  <div className="mt-4">
                    {dueTab==="Custom" && (
                      <div className="mb-3">
                        <label className="text-[11px] tracking-widest uppercase text-ink-muted">Date (Custom)</label>
                        <input type="date" value={customDate} onChange={e=> setCustomDate(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-full border border-line bg-surface-flat text-[13px]" />
                      </div>
                    )}
                    <WheelTimePicker hour={hour} minute={minute} period={period} onChange={(h,m,p)=> { setHour(h); setMinute(m); setPeriod(p); }} />
                    <div className="mt-3 text-center text-[13px] text-ink">
                      Due: <span className="font-medium">{dueTab}{dueTab==="Custom" && customDate ? ` ${customDate}`: ""} · {String(hour).padStart(2,"0")}:{String(minute).padStart(2,"0")} {period} WAT</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-ink-muted">Category</label>
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-2 snap-x">
                    {["Design","Development","Personal","Work"].map(c=>{
                      const active = category===c;
                      return (
                        <button key={c} onClick={()=> setCategory(c)} className={`h-7 px-4 rounded-full text-[12px] font-medium whitespace-nowrap border transition ${active?"bg-surface text-coral shadow-focused border-line":"bg-blue-soft text-blue-ink border-transparent"}`}>{c}</button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={create} className="flex-1 h-12 rounded-full bg-coral text-on-coral font-medium">Add Task</button>
                  <button onClick={handleVoiceTodo} className={`w-12 h-12 rounded-full border grid place-items-center transition ${voice.state==="recording" ? "bg-ink text-surface border-ink animate-pulse" : "bg-surface-flat border-line text-ink-muted hover:border-coral"}`} title="Voice to-do — tap to speak, tap again to save">
                    {voice.state==="recording" ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
                {voice.state==="recording" && <p className="text-[12px] text-coral-ink text-center">Listening… speak now, WAT transcription live. Tap again to create task.</p>}
                {!voice.supported && <p className="text-[11px] text-ink-muted text-center">Mic transcription requires browser SpeechRecognition — fallback typing still works.</p>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {todoToast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-ink text-surface rounded-full px-4 py-2 text-[13px] font-medium z-50">{todoToast}</div>
      )}

      {/* Single FAB */}
      <button onClick={()=> setShowAdd(true)} aria-label="Add Task" className="fixed z-30 w-14 h-14 rounded-full bg-coral text-on-coral grid place-items-center shadow-fab active:scale-[0.94] transition"
        style={{ bottom: "calc(88px + env(safe-area-inset-bottom))", right: "16px" }}>
        <Plus className="w-6 h-6" strokeWidth={2.2} />
      </button>
      <style>{`@media(min-width:1024px){ button[aria-label="Add Task"]{ bottom: 32px !important; right: 32px !important; } }`}</style>
    </div>
  );
}
