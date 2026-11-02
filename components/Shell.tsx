"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotebookPen, ListTodo, Linkedin, Instagram, BookOpen, Lock, Plus, Search, Bell, Sun, Moon, Monitor, Home } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

const nav = [
  { href:"/notes", label:"Notes", icon: NotebookPen, tint:"var(--blue-soft)" },
  { href:"/todo", label:"Tasks", icon: ListTodo, tint:"var(--coral-soft)" },
  { href:"/linkedin", label:"LinkedIn", icon: Linkedin, tint:"#DCEBEF" },
  { href:"/instagram", label:"Instagram", icon: Instagram, tint:"#F7E6D4" },
  { href:"/blog", label:"Blog", icon: BookOpen, tint:"#E1EFE8" },
  { href:"/private", label:"Private", icon: Lock, tint:"#F3E3E8" },
];

function ThemeToggle(){
  const [theme, setTheme] = useState<"system"|"light"|"dark">("system");
  useEffect(()=>{
    const s = (localStorage.getItem("hub-theme") as any) || "system";
    setTheme(s);
  },[]);
  const set = (v:"system"|"light"|"dark")=>{
    setTheme(v);
    if(v==="system"){ localStorage.removeItem("hub-theme"); document.documentElement.removeAttribute("data-theme"); }
    else { localStorage.setItem("hub-theme", v); document.documentElement.setAttribute("data-theme", v); }
  };
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1">
      <button onClick={()=> set("system")} className={`w-7 h-7 rounded-full grid place-items-center ${theme==="system"?"bg-ink text-surface":"text-ink-muted"}`} aria-label="System"><Monitor className="w-3.5 h-3.5"/></button>
      <button onClick={()=> set("light")} className={`w-7 h-7 rounded-full grid place-items-center ${theme==="light"?"bg-ink text-surface":"text-ink-muted"}`} aria-label="Light"><Sun className="w-3.5 h-3.5"/></button>
      <button onClick={()=> set("dark")} className={`w-7 h-7 rounded-full grid place-items-center ${theme==="dark"?"bg-ink text-surface":"text-ink-muted"}`} aria-label="Dark"><Moon className="w-3.5 h-3.5"/></button>
    </div>
  );
}

function BottomNav({ pathname }: { pathname:string }){
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 pointer-events-none" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-3 mb-3 glass rounded-[28px] h-[64px] flex items-center justify-between px-1.5 pointer-events-auto border border-white/40" style={{ boxShadow: "0 8px 32px rgba(74,117,137,0.16)" }}>
        {nav.map(item=>{
          const active = pathname?.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-full">
              <span className={`w-7 h-7 rounded-full grid place-items-center transition ${active ? "ring-1 ring-ink text-ink bg-surface shadow-sm" : "text-ink-muted hover:text-ink"}`} aria-label={item.label}>
                <item.icon className="w-[18px] h-[18px]" />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function SideRail({ pathname }: { pathname:string }){
  return (
    <aside className="hidden lg:flex w-[80px] shrink-0 sticky top-0 h-screen flex-col items-center py-6 gap-4 border-r border-line bg-surface/60 backdrop-blur">
      <div className="w-9 h-9 rounded-full bg-ink text-surface grid place-items-center font-semibold text-[14px]">H</div>
      <nav className="flex flex-col gap-2 mt-2">
        <Link href="/" className={`w-10 h-10 rounded-full grid place-items-center ${pathname==="/"?"bg-surface shadow-focused text-ink ring-1 ring-line":"text-ink-muted hover:bg-surface-flat"}`}><Home className="w-5 h-5"/></Link>
        {nav.map(item=>{
          const active = pathname?.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`w-10 h-10 rounded-full grid place-items-center transition ${active ? "bg-surface shadow-focused text-ink ring-1 ring-line" : "text-ink-muted hover:bg-surface-flat"}`} title={item.label}>
              <item.icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <div className="w-8 h-8 rounded-full bg-teal text-on-teal grid place-items-center text-[11px] font-medium">U</div>
      </div>
    </aside>
  );
}

export default function Shell({ children }: { children: React.ReactNode }){
  const pathname = usePathname();
  const { search, setSearch, todos } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(()=> setMounted(true), []);
  const todayCount = todos.filter(t=>{
    if(!mounted) return false;
    return t.status==="open" && t.dueAt && new Date(t.dueAt).toLocaleDateString("en-GB",{timeZone:"Africa/Lagos"}) === new Date().toLocaleDateString("en-GB",{timeZone:"Africa/Lagos"});
  }).length;

  return (
    <div className="app-frame flex min-h-screen">
      <SideRail pathname={pathname || ""} />
      <div className="flex-1 min-w-0 flex flex-col bg-bg">
        <header className="h-[56px] flex items-center gap-3 px-4 md:px-6 border-b border-line bg-surface shadow-sm sticky top-0 z-30">
          <Link href="/notes" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-ink text-surface grid place-items-center font-semibold text-[13px]">H</div>
            <span className="font-normal text-[16px] hidden md:block text-ink">Hub Station</span>
            <span className="text-[10px] tracking-widest uppercase text-ink-muted hidden md:block border border-line rounded-full px-2 py-0.5">Uneek · Lagos</span>
          </Link>
          <div className="flex-1 max-w-[420px] ml-2 md:ml-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input value={search} onChange={e=> setSearch(e.target.value)} placeholder="Search notes, todos, drafts…" className="w-full h-9 pl-9 pr-3 rounded-full border border-line bg-surface-flat text-[14px] placeholder:text-ink-muted text-ink focus:outline-none focus:border-ink/20" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-teal text-on-teal grid place-items-center text-[11px] font-medium">U</div>
          </div>
        </header>

        <main className="flex-1 min-w-0 pb-24 lg:pb-6">
          <div className="px-4 md:px-6 py-6 md:py-8 max-w-[1200px] mx-auto w-full">
            {children}
          </div>
        </main>

        <BottomNav pathname={pathname || ""} />
        {/* FAB is now owned by individual pages (To-do / Notes) to avoid duplicates */}
      </div>
    </div>
  );
}
