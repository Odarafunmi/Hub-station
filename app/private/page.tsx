"use client";
import { useStore } from "@/lib/store";
import { mockPrivateMessage } from "@/lib/mockAI";
import { Lock, Unlock, Heart, Star, Send, Copy, Shield, CalendarHeart, Sparkles, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

function fmtLagosTime(d:string){
  const day = new Intl.DateTimeFormat("en-GB",{ day:"numeric", month:"short", timeZone:"Africa/Lagos"}).format(new Date(d));
  const hm = new Intl.DateTimeFormat("en-GB",{ hour:"2-digit", minute:"2-digit", hour12:false, timeZone:"Africa/Lagos"}).format(new Date(d));
  return `${day} ${hm}`;
}
function fmtLagosDay(d:string){
  return new Intl.DateTimeFormat("en-GB",{ day:"numeric", month:"short", timeZone:"Africa/Lagos"}).format(new Date(d));
}

export default function PrivatePage(){
  const pathname = usePathname();
  const { privateProfile, setPrivateProfile, privateMessages, addPrivateMessage } = useStore();
  const [locked, setLocked] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPin, setShowPin] = useState(false);
  // setup states
  const [setupPin, setSetupPin] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [setupError, setSetupError] = useState("");
  const [occasion, setOccasion] = useState("morning");
  const [tone, setTone] = useState("sweet");
  const [length, setLength] = useState("short");
  const [langMix, setLangMix] = useState("English");
  const [generated, setGenerated] = useState<string[]>([]);
  const [detailsEdit, setDetailsEdit] = useState(false);
  const [details, setDetails] = useState(privateProfile.details);
  const [favFilter, setFavFilter] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");

  // Detect first-time: no pinHash set
  useEffect(()=>{
    const hasPin = !!(privateProfile?.pinHash && privateProfile.pinHash.length >= 4);
    setNeedsSetup(!hasPin);
    // if no pin, stay locked but show setup UI; otherwise locked is true until entered
    if(!hasPin) setLocked(true);
  }, [privateProfile?.pinHash]);

  // Auto-lock when leaving website/private section
  useEffect(()=>{
    const handleVisibility = () => {
      if (document.hidden) setLocked(true);
    };
    const handlePageHide = () => setLocked(true);
    const handleBlur = () => {
      // lock after 30s away? immediate for privacy
      // we use timeout to avoid locking on simple tab switch quickly? spec says automatically when leaving
      setTimeout(()=> {
        if (document.hidden) setLocked(true);
      }, 1000);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("blur", handleBlur);
    return ()=>{
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Also lock when route changes away from /private (handled by parent? but we also lock on unmount)
  useEffect(()=>{
    return ()=> { setLocked(true); };
  }, [pathname]);

  const handleSetup = ()=>{
    setSetupError("");
    if(!setupPin || setupPin.length < 4) { setSetupError("PIN must be at least 4 digits"); return; }
    if(setupPin !== setupConfirm) { setSetupError("PINs do not match"); return; }
    if(!/^\d+$/.test(setupPin)) { setSetupError("PIN should be numbers only"); return; }
    setPrivateProfile({ ...privateProfile, pinHash: setupPin });
    setSetupPin(""); setSetupConfirm(""); setNeedsSetup(false); setLocked(false);
  };

  const unlock = ()=>{
    const hash = privateProfile.pinHash || "";
    if(!hash) { setPinError("Please set a PIN first"); return; }
    if(pinInput===hash){
      setLocked(false); setPinError("");
      // auto re-lock after 5 minutes inactivity (optional but keep)
      setTimeout(()=> { setLocked(true); }, 5*60*1000);
    } else setPinError("Incorrect PIN — try again");
  };

  const handleResetPin = ()=>{
    setSetupError("");
    if(!pinInput) { setSetupError("Enter current PIN first"); return; }
    if(pinInput !== privateProfile.pinHash) { setSetupError("Current PIN incorrect"); return; }
    if(!setupPin || setupPin.length < 4) { setSetupError("New PIN must be at least 4 digits"); return; }
    if(setupPin !== setupConfirm) { setSetupError("New PINs do not match"); return; }
    setPrivateProfile({ ...privateProfile, pinHash: setupPin });
    setResetMode(false); setSetupPin(""); setSetupConfirm(""); setPinInput(""); setSetupError("");
  };

  const generate = ()=>{
    const v1 = mockPrivateMessage(occasion, tone, privateProfile);
    const v2 = mockPrivateMessage(occasion, tone, privateProfile) + "\n\n— variant 2";
    setGenerated([v1, v2]);
  };

  if(locked){
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 -m-6 md:-m-8" style={{ background: "radial-gradient(120% 120% at 30% 20%, #4C1D95 0%, #2D1B4E 55%, #1A1033 100%)" }}>
        <div className="w-full max-w-[480px] rounded-[32px] border border-white/10 p-8 text-center shadow-sheet" style={{ background: "rgba(255,255,255,0.06)", backdropFilter:"blur(20px)" }}>
          <div className="w-12 h-12 rounded-full grid place-items-center mx-auto" style={{ background:"#EDE9FE", color:"#4C1D95" }}><Lock className="w-6 h-6"/></div>
          <h1 className="font-medium text-[22px] mt-4" style={{ color:"#EDE9FE" }}>{needsSetup ? "Set your Private PIN" : "Private — locked"}</h1>
          <p className="text-[13px] mt-2 leading-5" style={{ color:"#C4B5FD" }}>
            {needsSetup
              ? "First time here? Choose a 4–6 digit PIN. It locks automatically when you leave and is required on return."
              : "This section is hidden from search and ‘turn into’ menus. Auto-locks when you leave the app."}
          </p>

          {needsSetup ? (
            <div className="mt-6 space-y-3 text-left">
              <div>
                <label className="text-[11px] tracking-widest uppercase" style={{ color:"#C4B5FD" }}>Enter PIN</label>
                <div className="relative mt-1">
                  <input value={setupPin} onChange={e=> setSetupPin(e.target.value.replace(/\D/g,""))} placeholder="••••" type={showPin ? "text" : "password"} maxLength={6} className="h-11 w-full px-4 rounded-full border bg-white/10 text-center tracking-[0.3em] text-[16px] focus:outline-none placeholder:text-white/40" style={{ borderColor:"rgba(255,255,255,0.2)", color:"#fff" }} />
                  <button onClick={()=> setShowPin(!showPin)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 grid place-items-center" style={{ color:"#EDE9FE" }}>{showPin ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
                </div>
              </div>
              <div>
                <label className="text-[11px] tracking-widest uppercase" style={{ color:"#C4B5FD" }}>Confirm PIN</label>
                <input value={setupConfirm} onChange={e=> setSetupConfirm(e.target.value.replace(/\D/g,""))} placeholder="••••" type={showPin ? "text" : "password"} maxLength={6} className="h-11 w-full mt-1 px-4 rounded-full border bg-white/10 text-center tracking-[0.3em] text-[16px] focus:outline-none" style={{ borderColor:"rgba(255,255,255,0.2)", color:"#fff" }} />
              </div>
              {setupError && <p className="text-[11px] text-center" style={{ color:"#FCA5A5" }}>{setupError}</p>}
              <button onClick={handleSetup} className="w-full h-11 rounded-full font-medium text-[14px]" style={{ background:"#EDE9FE", color:"#2D1B4E" }}>Save PIN & Unlock</button>
              <p className="text-[11px] text-center" style={{ color:"#A78BFA" }}>You can reset PIN anytime inside (bottom of page).</p>
            </div>
          ) : (
            <>
              <div className="mt-6 flex gap-2 justify-center">
                <div className="relative">
                  <input value={pinInput} onChange={e=> setPinInput(e.target.value)} onKeyDown={e=> e.key==="Enter" && unlock()} placeholder="Enter PIN" type={showPin ? "text" : "password"} maxLength={6} className="h-11 w-[170px] px-4 pr-8 rounded-full border bg-white/10 text-center tracking-[0.3em] text-[14px] focus:outline-none focus:border-white/40" style={{ borderColor:"rgba(255,255,255,0.2)", color:"#fff" }} />
                  <button onClick={()=> setShowPin(!showPin)} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full grid place-items-center" style={{ color:"#C4B5FD" }}>{showPin ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}</button>
                </div>
                <button onClick={unlock} className="h-11 px-6 rounded-full font-semibold text-[13px] inline-flex items-center gap-2" style={{ background:"#EDE9FE", color:"#2D1B4E" }}><Unlock className="w-4 h-4"/>Unlock</button>
              </div>
              {pinError && <p className="text-[11px] mt-3" style={{ color:"#FCA5A5" }}>{pinError}</p>}
              <p className="text-[11px] mt-4" style={{ color:"#A78BFA" }}>Forgot PIN? Clear site storage to reset (demo). Auto-lock on leaving.</p>
            </>
          )}

          <div className="mt-6 rounded-[16px] border p-3 text-left" style={{ borderColor:"rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)" }}>
            <div className="text-[11px] tracking-widest uppercase flex items-center gap-2" style={{ color:"#C4B5FD" }}><Shield className="w-3.5 h-3.5"/> Security note</div>
            <p className="text-[12px] leading-5 mt-1" style={{ color:"#C4B5FD" }}>PIN protects against casual access. No private content is used for LinkedIn/Instagram/blog. Lock is immediate on visibility loss + 5 min timeout.</p>
          </div>
        </div>
      </div>
    );
  }

  const filtered = favFilter ? privateMessages.filter(m=> m.favourite) : privateMessages;

  return (
    <div className="space-y-6">
      {/* Deep purple header */}
      <div className="rounded-[32px] p-6 flex items-center gap-3 border border-white/10" style={{ background:"linear-gradient(135deg, #4C1D95 0%, #2D1B4E 100%)" }}>
        <div className="w-8 h-8 rounded-full grid place-items-center" style={{ background:"#EDE9FE", color:"#4C1D95" }}><Heart className="w-4 h-4 fill-[#4C1D95]"/></div>
        <h1 className="font-medium text-[22px]" style={{ color:"#EDE9FE" }}>Private messages</h1>
        <span className="text-[11px] tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ background:"rgba(237,233,254,0.15)", color:"#EDE9FE", border:"1px solid rgba(237,233,254,0.2)" }}>Unlocked</span>
        <button onClick={()=> setLocked(true)} className="ml-auto h-8 px-3 rounded-full border text-[13px] inline-flex items-center gap-1" style={{ background:"rgba(255,255,255,0.1)", color:"#EDE9FE", borderColor:"rgba(255,255,255,0.15)" }}><Lock className="w-3.5 h-3.5"/>Lock now</button>
      </div>

      <div className="rounded-[24px] border border-line bg-surface p-5">
        <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-[#4C1D95]"/><h2 className="font-medium text-ink">Relationship profile</h2><span className="text-[11px] text-ink-muted ml-auto">Only what you enter is used</span></div>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {Object.entries(details).map(([k,v])=>(
            <div key={k} className="rounded-[12px] border border-line bg-surface-flat p-3">
              <div className="text-[11px] tracking-widest uppercase text-ink-muted">{k}</div>
              {detailsEdit ? (
                <textarea value={v as string} onChange={e=> setDetails({...details, [k]: e.target.value})} rows={2} className="w-full mt-1 rounded-[12px] border border-line bg-surface p-2 text-[13px] text-ink" />
              ) : (
                <div className="text-[13px] leading-5 mt-1 text-ink">{v as string || "—"}</div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <button onClick={()=> setDetailsEdit(!detailsEdit)} className="h-8 px-3 rounded-full border border-line bg-surface text-[13px]">{detailsEdit?"Cancel":"Edit"}</button>
          {detailsEdit && <button onClick={()=> { setPrivateProfile({ ...privateProfile, details }); setDetailsEdit(false); }} className="h-8 px-4 rounded-full bg-ink text-surface text-[13px] font-medium">Save profile</button>}
        </div>
      </div>

      <div className="rounded-[24px] border p-5 shadow-sm" style={{ background:"#2D1B4E", borderColor:"rgba(237,233,254,0.15)" }}>
        <h3 className="font-medium flex items-center gap-2" style={{ color:"#EDE9FE" }}><Sparkles className="w-4 h-4" style={{ color:"#C4B5FD" }}/> Generate a message</h3>
        <div className="grid md:grid-cols-4 gap-3 mt-3">
          <select value={occasion} onChange={e=> setOccasion(e.target.value)} className="h-10 px-3 rounded-full border text-[13px]" style={{ background:"rgba(255,255,255,0.1)", color:"#EDE9FE", borderColor:"rgba(255,255,255,0.2)" }}>
            <option value="morning" style={{color:"#2D1B4E"}}>Morning</option><option value="birthday" style={{color:"#2D1B4E"}}>Birthday</option><option value="anniversary" style={{color:"#2D1B4E"}}>Anniversary</option><option value="apology" style={{color:"#2D1B4E"}}>Apology</option><option value="encouragement" style={{color:"#2D1B4E"}}>Encouragement</option><option value="just because" style={{color:"#2D1B4E"}}>Just because</option>
          </select>
          <select value={tone} onChange={e=> setTone(e.target.value)} className="h-10 px-3 rounded-full border text-[13px]" style={{ background:"rgba(255,255,255,0.1)", color:"#EDE9FE", borderColor:"rgba(255,255,255,0.2)" }}>
            <option value="sweet" style={{color:"#2D1B4E"}}>Sweet</option><option value="playful" style={{color:"#2D1B4E"}}>Playful</option><option value="deep" style={{color:"#2D1B4E"}}>Deep</option><option value="formal" style={{color:"#2D1B4E"}}>Formal</option>
          </select>
          <select value={length} onChange={e=> setLength(e.target.value)} className="h-10 px-3 rounded-full border text-[13px]" style={{ background:"rgba(255,255,255,0.1)", color:"#EDE9FE", borderColor:"rgba(255,255,255,0.2)" }}>
            <option value="short" style={{color:"#2D1B4E"}}>Short</option><option value="medium" style={{color:"#2D1B4E"}}>Medium</option><option value="long" style={{color:"#2D1B4E"}}>Long</option>
          </select>
          <select value={langMix} onChange={e=> setLangMix(e.target.value)} className="h-10 px-3 rounded-full border text-[13px]" style={{ background:"rgba(255,255,255,0.1)", color:"#EDE9FE", borderColor:"rgba(255,255,255,0.2)" }}>
            <option style={{color:"#2D1B4E"}}>English</option><option style={{color:"#2D1B4E"}}>English + Yoruba</option><option style={{color:"#2D1B4E"}}>English + Pidgin</option>
          </select>
        </div>
        <button onClick={generate} className="mt-3 h-10 px-5 rounded-full font-medium text-[13px] inline-flex items-center gap-2" style={{ background:"#EDE9FE", color:"#2D1B4E" }}><Sparkles className="w-4 h-4"/>Generate 2 variants</button>
        <p className="text-[11px] mt-2" style={{ color:"#C4B5FD" }}>Written in your voice, using details from the profile so messages feel specific.</p>

        {generated.length>0 && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {generated.map((g,i)=>(
              <div key={i} className="rounded-[16px] border p-4" style={{ background:"rgba(255,255,255,0.06)", borderColor:"rgba(255,255,255,0.15)" }}>
                <div className="text-[11px] tracking-widest uppercase" style={{ color:"#C4B5FD" }}>Variant {i+1} · {tone} · {occasion}</div>
                <p className="text-[14px] leading-6 whitespace-pre-wrap mt-2" style={{ color:"#EDE9FE" }}>{g}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=> addPrivateMessage({ id: Math.random().toString(36).slice(2,9), occasion, tone, body:g, createdAt: new Date().toISOString() })} className="h-8 px-3 rounded-full text-[13px] inline-flex items-center gap-1" style={{ background:"#EDE9FE", color:"#2D1B4E" }}>Save</button>
                  <button onClick={()=> navigator.clipboard.writeText(g)} className="h-8 px-3 rounded-full border text-[13px] inline-flex items-center gap-1" style={{ background:"transparent", color:"#EDE9FE", borderColor:"rgba(255,255,255,0.2)" }}><Copy className="w-3.5 h-3.5"/>Copy</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-line bg-surface p-5">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-ink">History · {privateMessages.length} messages</h3>
          <button onClick={()=> setFavFilter(!favFilter)} className={`ml-auto h-8 px-3 rounded-full border text-[12px] inline-flex items-center gap-1 ${favFilter?"bg-amber-50 border-amber-200 text-amber-700":"bg-surface border-line text-ink-muted"}`}><Star className="w-3.5 h-3.5"/>Favourites</button>
        </div>
        {filtered.length===0 ? (
          <p className="text-[13px] text-ink-muted mt-4 text-center py-6 border border-dashed border-line rounded-[16px]">No messages yet — generate one above.</p>
        ) : (
        <div className="mt-4 space-y-3">
          {filtered.map(m=>(
            <div key={m.id} className="rounded-[16px] border border-line bg-surface-flat/40 p-4">
              <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-ink-muted">
                <span suppressHydrationWarning>{m.occasion} · {m.tone} · {fmtLagosTime(m.createdAt)}</span>
                {m.favourite && <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 inline-flex items-center gap-1"><Star className="w-3 h-3"/>Favourite</span>}
                {m.sentAt && <span suppressHydrationWarning className="px-2 py-0.5 rounded-full bg-ink text-surface">Sent {fmtLagosDay(m.sentAt)}</span>}
              </div>
              <p className="text-[14px] leading-6 whitespace-pre-wrap mt-2 text-ink">{m.body}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={()=> { const nm = {...m, id: Math.random().toString(36).slice(2,9), createdAt: new Date().toISOString(), favourite: !m.favourite }; addPrivateMessage(nm); }} className="h-7 px-3 rounded-full border border-line bg-surface text-[12px] inline-flex items-center gap-1"><Star className="w-3 h-3"/>{m.favourite?"Unfavourite":"Favourite"}</button>
                <button onClick={()=> navigator.clipboard.writeText(m.body)} className="h-7 px-3 rounded-full border border-line bg-surface text-[12px] inline-flex items-center gap-1"><Copy className="w-3 h-3"/>Copy</button>
                <button className="h-7 px-3 rounded-full bg-ink text-surface text-[12px] inline-flex items-center gap-1"><Send className="w-3 h-3"/>Mark sent</button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      <div className="rounded-[24px] border border-line bg-surface p-4">
        <h3 className="font-medium flex items-center gap-2 text-ink"><CalendarHeart className="w-4 h-4 text-[#4C1D95]"/> Important dates (shown only here)</h3>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {["Anniversary — 14 Feb","Her birthday — 22 Aug","Valentine's — 14 Feb"].map(d=>(
            <div key={d} className="rounded-[12px] border border-line bg-surface-flat p-3 flex items-center gap-2">
              <CalendarHeart className="w-4 h-4 text-ink-muted"/><span className="text-[13px] font-medium text-ink">{d}</span><span className="ml-auto text-[11px] text-ink-muted">Reminder</span>
            </div>
          ))}
        </div>
      </div>

      {/* PIN Reset section */}
      <div className="rounded-[24px] border p-5" style={{ background:"#F5F3FF", borderColor:"#DDD6FE" }}>
        <h3 className="font-medium flex items-center gap-2" style={{ color:"#2D1B4E" }}><RotateCcw className="w-4 h-4"/> Reset PIN</h3>
        <p className="text-[13px] mt-1" style={{ color:"#5B21B6" }}>Change your private PIN anytime. Enter current PIN + new PIN + confirm.</p>
        {!resetMode ? (
          <button onClick={()=> setResetMode(true)} className="mt-3 h-9 px-4 rounded-full border text-[13px]" style={{ background:"#fff", color:"#4C1D95", borderColor:"#DDD6FE" }}>Change PIN</button>
        ) : (
          <div className="mt-3 space-y-2 max-w-[420px]">
            <input value={pinInput} onChange={e=> setPinInput(e.target.value.replace(/\D/g,""))} placeholder="Current PIN" type={showPin ? "text":"password"} maxLength={6} className="h-10 w-full px-4 rounded-full border bg-white text-[13px] tracking-widest" style={{ borderColor:"#DDD6FE" }} />
            <input value={setupPin} onChange={e=> setSetupPin(e.target.value.replace(/\D/g,""))} placeholder="New PIN (4-6 digits)" type={showPin ? "text":"password"} maxLength={6} className="h-10 w-full px-4 rounded-full border bg-white text-[13px] tracking-widest" style={{ borderColor:"#DDD6FE" }} />
            <input value={setupConfirm} onChange={e=> setSetupConfirm(e.target.value.replace(/\D/g,""))} placeholder="Confirm new PIN" type={showPin ? "text":"password"} maxLength={6} className="h-10 w-full px-4 rounded-full border bg-white text-[13px] tracking-widest" style={{ borderColor:"#DDD6FE" }} />
            {setupError && <p className="text-[11px]" style={{ color:"#DC2626" }}>{setupError}</p>}
            <div className="flex gap-2">
              <button onClick={handleResetPin} className="h-9 px-4 rounded-full font-medium text-[13px]" style={{ background:"#4C1D95", color:"#fff" }}>Save new PIN</button>
              <button onClick={()=> { setResetMode(false); setSetupError(""); }} className="h-9 px-4 rounded-full border bg-white text-[13px]" style={{ borderColor:"#DDD6FE" }}>Cancel</button>
              <button onClick={()=> setShowPin(!showPin)} className="ml-auto h-9 px-3 rounded-full border bg-white text-[12px]" style={{ borderColor:"#DDD6FE" }}>{showPin ? "Hide" : "Show"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
