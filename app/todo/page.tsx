"use client";
import { useStore } from "@/lib/store";
import { Pill, BottomSheet, TaskCard, Donut, BarChart } from "@/components/ui";
import { isPast, addMinutes, addHours, addDays } from "date-fns";
import { Check, Clock, Plus, Bell, Trash2, ChevronDown, ChevronRight, Sparkles, Mic } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function fmt(dateStr?:string){
  if(!dateStr) return "—";
  const d = new Date(dateStr);
  const day = new Intl.DateTimeFormat("en-GB",{ day:"numeric", month:"short", timeZone:"Africa/Lagos"}).format(d);
  const time = new Intl.DateTimeFormat("en-US",{ hour:"numeric", minute:"2-digit", hour12:true, timeZone:"Africa/Lagos"}).format(d);
  return `${day} · ${time}`;
}

export default function TodoPage(){
  const { todos, addTodo, updateTodo, deleteTodo, notes } = useStore();
  const [tab, setTab] = useState<"today"|"upcoming"|"overdue"|"done">("today");
  const [showMissed, setShowMissed] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dueTab, setDueTab] = useState<"Today"|"Tomorrow"|"Custom">("Today");
  const [category, setCategory] = useState("Design");
  const [customDue, setCustomDue] = useState("");

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

  const create = ()=>{
    if(!title.trim()) return;
    let dueAt: string | undefined;
    if(dueTab==="Today") dueAt = new Date(new Date().setHours(17,0,0,0)).toISOString();
    else if(dueTab==="Tomorrow") dueAt = new Date(new Date().setDate(new Date().getDate()+1)).toISOString();
    else if(customDue) dueAt = new Date(customDue).toISOString();
    addTodo({ id: Math.random().toString(36).slice(2,9), title: title.trim(), notes:"", dueAt, remindAt: dueAt?[dueAt]:[], priority:"med", status:"open", repeat:"none", tags:[category], createdAt: new Date().toISOString() });
    setTitle(""); setShowAdd(false);
  };

  const snooze = (id:string, mins:number)=>{
    const until = mins===1440 ? addDays(new Date(),1).toISOString() : mins===60 ? addHours(new Date(),1).toISOString() : addMinutes(new Date(), mins).toISOString();
    updateTodo(id, (x)=> ({...x, snoozedUntil: until, dueAt: until, remindAt: [until]}));
  };

  return (
    <div className="space-y-6 max-w-[640px] mx-auto lg:max-w-none">
      {/* Missed Tasks layer — tucked behind sheet */}
      <div className="relative">
        <motion.div
          layout
          className={`rounded-[24px] bg-teal-mid text-on-teal overflow-hidden ${showMissed?"":"h-[44px]"}`}
          initial={false}
          animate={{ height: showMissed ? "auto" : 44 }}
          transition={{ duration:0.45, ease:[0.22,1,0.36,1] }}
        >
          <button onClick={()=> setShowMissed(!showMissed)} className="w-full flex items-center justify-between px-6 h-[44px]">
            <span className="text-[14px] font-medium">Missed Tasks</span>
            <span className="flex items-center gap-2 text-[12px] text-on-teal/80">{lists.overdue.length} <motion.span animate={{ rotate: showMissed?180:0 }} transition={{ duration:0.28 }}><ChevronDown className="w-4 h-4"/></motion.span></span>
          </button>
          <AnimatePresence>
            {showMissed && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="px-4 pb-4 space-y-2">
                {lists.overdue.length===0 ? <p className="text-[13px] text-on-teal/70 px-2">No missed tasks — calm.</p> :
                  lists.overdue.map(t=>(
                    <motion.div key={t.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.04 }} className="bg-white/10 rounded-[16px] px-4 py-3 flex items-center gap-3">
                      <span className="text-[13px] text-on-teal flex-1">{t.title}</span>
                      <span className="text-[12px] text-on-teal/60">{t.dueAt ? fmt(t.dueAt) : ""}</span>
                      <button onClick={()=> updateTodo(t.id, x=> ({...x, status:"done"}))} className="w-8 h-8 rounded-full bg-surface text-teal grid place-items-center"><Check className="w-4 h-4"/></button>
                    </motion.div>
                  ))
                }
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Active Tasks sheet — sits on top of teal header */}
        <motion.div layout className="mt-3 bg-bg rounded-t-[32px] shadow-sheet border border-line overflow-hidden">
          <div className="sheet-handle" />
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-[24px]/[32px] font-normal text-ink">Active Tasks</h2>
            <button onClick={()=> setTab(tab==="today"?"upcoming":"today")} className="text-[13px] font-medium text-teal flex items-center gap-1">View list <ChevronRight className="w-4 h-4"/></button>
          </div>

          {/* Tab underline for Today/Upcoming/Overdue/Done — coral sliding */}
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
                <p className="text-[13px] text-ink-muted mt-1">Tap + to add one. Due tabs slide the coral underline.</p>
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

      {/* Stat cards — donut + bar */}
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
              className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-[32px] shadow-sheet max-h-[85vh] overflow-auto"
              style={{ paddingBottom:"env(safe-area-inset-bottom)" }}
            >
              <div className="sheet-handle" />
              <div className="px-6 py-4 flex items-center justify-between">
                <h3 className="text-[20px] font-normal">Add a Task</h3>
                <button onClick={()=> setShowAdd(false)} className="w-8 h-8 rounded-full bg-surface-flat grid place-items-center">✕</button>
              </div>
              <div className="px-6 pb-6 space-y-6">
                <div>
                  <label className="text-[12px] text-ink-muted">Task title</label>
                  <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="e.g. Draft LinkedIn post" className="w-full mt-1 border-0 border-b border-line focus:border-coral outline-none py-2 text-[15px] bg-transparent placeholder:text-ink-muted/50" autoFocus />
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
                  {dueTab==="Custom" && <input type="datetime-local" value={customDue} onChange={e=> setCustomDue(e.target.value)} className="w-full mt-3 h-10 px-3 rounded-full border border-line bg-surface-flat text-[13px]" />}
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
                  <button className="w-12 h-12 rounded-full bg-surface-flat border border-line grid place-items-center"><Mic className="w-5 h-5 text-ink-muted"/></button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button (desktop handled by Shell, this is the mobile FAB) */}
      <div className="lg:hidden fixed bottom-20 right-4 z-30">
        <button onClick={()=> setShowAdd(true)} className="w-14 h-14 rounded-full bg-coral text-on-coral grid place-items-center shadow-fab">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop button */}
      <div className="hidden lg:block">
        <button onClick={()=> setShowAdd(true)} className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-coral text-on-coral grid place-items-center shadow-fab z-30">
          <Plus className="w-6 h-6"/>
        </button>
      </div>
    </div>
  );
}
