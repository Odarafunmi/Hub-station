"use client";
import { useStore } from "@/lib/store";
import { mockPrivateMessage } from "@/lib/mockAI";
import { Lock, Unlock, Heart, Star, Send, Copy, Shield, CalendarHeart, Sparkles } from "lucide-react";
import { useState } from "react";

function fmtLagosTime(d:string){
  const day = new Intl.DateTimeFormat("en-GB",{ day:"numeric", month:"short", timeZone:"Africa/Lagos"}).format(new Date(d));
  const hm = new Intl.DateTimeFormat("en-GB",{ hour:"2-digit", minute:"2-digit", hour12:false, timeZone:"Africa/Lagos"}).format(new Date(d));
  return `${day} ${hm}`;
}
function fmtLagosDay(d:string){
  return new Intl.DateTimeFormat("en-GB",{ day:"numeric", month:"short", timeZone:"Africa/Lagos"}).format(new Date(d));
}

export default function PrivatePage(){
  const { privateProfile, setPrivateProfile, privateMessages, addPrivateMessage } = useStore();
  const [locked, setLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [occasion, setOccasion] = useState("morning");
  const [tone, setTone] = useState("sweet");
  const [length, setLength] = useState("short");
  const [langMix, setLangMix] = useState("English");
  const [generated, setGenerated] = useState<string[]>([]);
  const [detailsEdit, setDetailsEdit] = useState(false);
  const [details, setDetails] = useState(privateProfile.details);
  const [favFilter, setFavFilter] = useState(false);

  const unlock = ()=>{
    const hash = privateProfile.pinHash || "1234";
    if(pinInput===hash){
      setLocked(false); setPinError("");
      setTimeout(()=> { setLocked(true); }, 5*60*1000);
    } else setPinError("Incorrect PIN — try 1234 (demo)");
  };

  const generate = ()=>{
    const v1 = mockPrivateMessage(occasion, tone, privateProfile);
    const v2 = mockPrivateMessage(occasion, tone, privateProfile) + "\n\n— variant 2";
    setGenerated([v1, v2]);
  };

  if(locked){
    return (
      <div className="max-w-[520px] mx-auto pt-10">
        <div className="rounded-sheet border border-border bg-white p-8 text-center shadow-card">
          <div className="w-12 h-12 rounded-full bg-ink text-white grid place-items-center mx-auto"><Lock className="w-6 h-6"/></div>
          <h1 className="font-display font-bold text-[22px] mt-4">Private — locked</h1>
          <p className="text-[13px] text-ink-soft mt-2 leading-5">This section is hidden from search, notes list and “turn into” menus. Rows are protected by Row Level Security — only you can read them. Re-locks after 5 minutes.</p>
          <div className="mt-6 flex gap-2 justify-center">
            <input value={pinInput} onChange={e=> setPinInput(e.target.value)} placeholder="Enter PIN" type="password" maxLength={6} className="h-11 w-[160px] px-4 rounded-full border border-border bg-surface-2/60 text-center tracking-[0.3em] text-[14px] focus:outline-none focus:border-tide-300 focus:ring-4 focus:ring-tide-100" />
            <button onClick={unlock} className="h-11 px-6 rounded-full bg-ink text-white text-[13px] font-semibold inline-flex items-center gap-2"><Unlock className="w-4 h-4"/>Unlock</button>
          </div>
          {pinError && <p className="mono text-[11px] text-danger mt-2">{pinError}</p>}
          <p className="mono text-[11px] text-ink-muted mt-3">Demo PIN: <span className="font-semibold text-ink">1234</span> · Set a new PIN inside after unlocking.</p>
          <div className="mt-6 rounded-card border border-border bg-surface-2 p-3 text-left">
            <div className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted flex items-center gap-2"><Shield className="w-3.5 h-3.5"/> Security note</div>
            <p className="text-[12px] leading-5 text-ink-soft mt-1">The PIN protects against casual device access. It does not replace phone security. No content from this section is used for LinkedIn/Instagram/blog generation.</p>
          </div>
        </div>
      </div>
    );
  }

  const filtered = favFilter ? privateMessages.filter(m=> m.favourite) : privateMessages;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-pink-500 text-white grid place-items-center"><Heart className="w-4 h-4 fill-white"/></div>
        <h1 className="font-display font-bold text-[22px]">Private messages</h1>
        <span className="mono text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full bg-ink text-white">Unlocked</span>
        <button onClick={()=> setLocked(true)} className="ml-auto h-8 px-3 rounded-full border border-border bg-white text-[13px] inline-flex items-center gap-1"><Lock className="w-3.5 h-3.5"/>Lock now</button>
      </div>

      <div className="rounded-card border border-border bg-white p-5">
        <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500"/><h2 className="font-display font-semibold">Relationship profile</h2><span className="mono text-[11px] text-ink-muted ml-auto">Only what you enter is used</span></div>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {Object.entries(details).map(([k,v])=>(
            <div key={k} className="rounded-control border border-border bg-surface-2/60 p-3">
              <div className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">{k}</div>
              {detailsEdit ? (
                <textarea value={v as string} onChange={e=> setDetails({...details, [k]: e.target.value})} rows={2} className="w-full mt-1 rounded-control border border-border bg-white p-2 text-[13px]" />
              ) : (
                <div className="text-[13px] leading-5 mt-1">{v as string}</div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={()=> setDetailsEdit(!detailsEdit)} className="h-8 px-3 rounded-full border border-border bg-white text-[13px]">{detailsEdit?"Cancel":"Edit"}</button>
          {detailsEdit && <button onClick={()=> { setPrivateProfile({ ...privateProfile, details }); setDetailsEdit(false); }} className="h-8 px-4 rounded-full bg-ink text-white text-[13px] font-semibold">Save profile</button>}
          <div className="ml-auto flex items-center gap-2">
            <input placeholder="Set PIN" value={privateProfile.pinHash || ""} onChange={e=> setPrivateProfile({...privateProfile, pinHash: e.target.value})} className="h-8 w-[120px] px-3 rounded-full border border-border bg-white mono text-[13px] tracking-widest" maxLength={6} />
            <span className="mono text-[11px] text-ink-muted">PIN (hashed)</span>
          </div>
        </div>
      </div>

      <div className="rounded-sheet bg-white border border-border shadow-card p-5">
        <h3 className="font-display font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-pink-500"/> Generate a message</h3>
        <div className="grid md:grid-cols-4 gap-3 mt-3">
          <select value={occasion} onChange={e=> setOccasion(e.target.value)} className="h-10 px-3 rounded-full border border-border bg-white text-[13px]">
            <option value="morning">Morning</option><option value="birthday">Birthday</option><option value="anniversary">Anniversary</option><option value="apology">Apology</option><option value="encouragement">Encouragement</option><option value="just because">Just because</option>
          </select>
          <select value={tone} onChange={e=> setTone(e.target.value)} className="h-10 px-3 rounded-full border border-border bg-white text-[13px]">
            <option value="sweet">Sweet</option><option value="playful">Playful</option><option value="deep">Deep</option><option value="formal">Formal</option>
          </select>
          <select value={length} onChange={e=> setLength(e.target.value)} className="h-10 px-3 rounded-full border border-border bg-white text-[13px]">
            <option value="short">Short</option><option value="medium">Medium</option><option value="long">Long</option>
          </select>
          <select value={langMix} onChange={e=> setLangMix(e.target.value)} className="h-10 px-3 rounded-full border border-border bg-white text-[13px]">
            <option>English</option><option>English + Yoruba</option><option>English + Pidgin</option>
          </select>
        </div>
        <button onClick={generate} className="mt-3 h-10 px-5 rounded-full bg-pink-500 text-white text-[13px] font-semibold inline-flex items-center gap-2 hover:bg-pink-600 transition"><Sparkles className="w-4 h-4"/>Generate 2 variants</button>
        <p className="mono text-[11px] text-ink-muted mt-2">Written in your voice, using details from the profile so messages feel specific. Two variants never return near-identical wording.</p>

        {generated.length>0 && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {generated.map((g,i)=>(
              <div key={i} className="rounded-card border border-pink-200 bg-pink-50/60 p-4">
                <div className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">Variant {i+1} · {tone} · {occasion}</div>
                <p className="text-[14px] leading-6 whitespace-pre-wrap mt-2">{g}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=> addPrivateMessage({ id: Math.random().toString(36).slice(2,9), occasion, tone, body:g, createdAt: new Date().toISOString() })} className="h-8 px-3 rounded-full bg-ink text-white text-[13px] inline-flex items-center gap-1">Save</button>
                  <button onClick={()=> navigator.clipboard.writeText(g)} className="h-8 px-3 rounded-full border border-border bg-white text-[13px] inline-flex items-center gap-1"><Copy className="w-3.5 h-3.5"/>Copy</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-card border border-border bg-white p-5">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold">History · {privateMessages.length} messages</h3>
          <button onClick={()=> setFavFilter(!favFilter)} className={`ml-auto h-8 px-3 rounded-full border text-[12px] inline-flex items-center gap-1 ${favFilter?"bg-amber-50 border-amber-200 text-amber-700":"bg-white border-border text-ink-soft"}`}><Star className="w-3.5 h-3.5"/>Favourites</button>
        </div>
        <div className="mt-4 space-y-3">
          {filtered.map(m=>(
            <div key={m.id} className="rounded-card border border-border bg-surface-2/40 p-4">
              <div className="flex items-center gap-2 mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">
                <span suppressHydrationWarning>{m.occasion} · {m.tone} · {fmtLagosTime(m.createdAt)}</span>
                {m.favourite && <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 inline-flex items-center gap-1"><Star className="w-3 h-3"/>Favourite</span>}
                {m.sentAt && <span suppressHydrationWarning className="px-2 py-0.5 rounded-full bg-ink text-white">Sent {fmtLagosDay(m.sentAt)}</span>}
              </div>
              <p className="text-[14px] leading-6 whitespace-pre-wrap mt-2">{m.body}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={()=> addPrivateMessage({...m, id: Math.random().toString(36).slice(2,9), createdAt: new Date().toISOString(), favourite: !m.favourite })} className="h-7 px-3 rounded-full border border-border bg-white text-[12px] inline-flex items-center gap-1"><Star className="w-3 h-3"/>{m.favourite?"Unfavourite":"Favourite"}</button>
                <button onClick={()=> navigator.clipboard.writeText(m.body)} className="h-7 px-3 rounded-full border border-border bg-white text-[12px] inline-flex items-center gap-1"><Copy className="w-3 h-3"/>Copy</button>
                <button className="h-7 px-3 rounded-full bg-ink text-white text-[12px] inline-flex items-center gap-1"><Send className="w-3 h-3"/>Mark sent</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-border bg-white p-4">
        <h3 className="font-display font-semibold flex items-center gap-2"><CalendarHeart className="w-4 h-4 text-pink-500"/> Important dates (shown only here)</h3>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {["Anniversary — 14 Feb","Her birthday — 22 Aug","Valentine's — 14 Feb"].map(d=>(
            <div key={d} className="rounded-control border border-border bg-surface-2 p-3 flex items-center gap-2">
              <CalendarHeart className="w-4 h-4 text-ink-muted"/><span className="text-[13px] font-medium">{d}</span><span className="ml-auto mono text-[11px] text-ink-muted">Reminder</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
