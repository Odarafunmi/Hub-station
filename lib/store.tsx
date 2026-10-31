"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { BlogPost, CalendarSlot, Draft, IdeaCard, Note, PrivateMessage, PrivateProfile, Snippet, Todo, VoiceProfile } from "./types";
import { mockYearlyCalendar } from "./mockAI";

type Store = {
  notes: Note[];
  drafts: Draft[];
  todos: Todo[];
  voiceProfile: VoiceProfile | null;
  linkedinCalendar: CalendarSlot[];
  instagramCalendar: CalendarSlot[];
  instagramPillars: any;
  blogPosts: BlogPost[];
  snippets: Snippet[];
  ideas: IdeaCard[];
  privateProfile: PrivateProfile;
  privateMessages: PrivateMessage[];
  search: string;
  // actions
  addNote: (n: Note) => void;
  updateNote: (id: string, fn: (x: Note)=>Note) => void;
  deleteNote: (id:string)=>void;
  addEntryToNote: (noteId:string, body:string, kind?: "text"|"voice", audioInfo?: any)=>void;
  addDraft: (d:Draft)=>void;
  updateDraft: (id:string, fn:(d:Draft)=>Draft)=>void;
  addTodo: (t:Todo)=>void;
  updateTodo: (id:string, fn:(t:Todo)=>Todo)=>void;
  deleteTodo: (id:string)=>void;
  setVoiceProfile: (v:VoiceProfile)=>void;
  setLinkedinCalendar: (c:CalendarSlot[])=>void;
  setInstagramCalendar: (c:CalendarSlot[])=>void;
  setInstagramPillars: (p:any)=>void;
  addBlogPost: (b:BlogPost)=>void;
  updateBlogPost: (id:string, fn:(b:BlogPost)=>BlogPost)=>void;
  addSnippet: (s:Snippet)=>void;
  addIdea: (i:IdeaCard)=>void;
  updateIdea: (id:string, fn:(x:IdeaCard)=>IdeaCard)=>void;
  setPrivateProfile: (p:PrivateProfile)=>void;
  addPrivateMessage: (m:PrivateMessage)=>void;
  setSearch: (s:string)=>void;
  hydrated: boolean;
};

const defaultNotes: Note[] = [];
const defaultTodos: Todo[] = [];

const defaultVoiceProfile: VoiceProfile = {
  answers: {
    who: "Uneek — brand and editorial designer in Lagos, running Uneek Designs studio. I blend psychology with design to help brands communicate clearly.",
    specialties: "Branding, print, editorial, social design. I care about clarity over decoration.",
    psychology: "Studying psychology — learning about bias, perception, storytelling. It changes how I price, present, and write.",
    audience: "Founders and marketing leads who value thoughtful design and clear communication.",
    goals: "Share lessons from studio life, build authority, attract clients who respect process.",
  },
  styleGuide: "Short sentences. First person. Concrete detail over hype. Open with tension, close with a gentle takeaway. Avoid stock openers ('In today's world'). Vary length. Flag invented facts.",
  samples: [
    "I used to think the work sold itself. It didn't. The way you present it does.",
    "Three reasons proposals go quiet — and none is price.",
  ],
  updatedAt: new Date().toISOString(),
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }){
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [todos, setTodos] = useState<Todo[]>(defaultTodos);
  const [voiceProfile, setVP] = useState<VoiceProfile | null>(defaultVoiceProfile);
  const [linkedinCalendar, setLC] = useState<CalendarSlot[]>([]);
  const [instagramCalendar, setIC] = useState<CalendarSlot[]>([]);
  const [instagramPillars, setIP] = useState<any>({
    showcase: true, process: true, education: true, client: true, personality: true,
    services: "Branding, print, editorial, social media design",
    goals: "Inquiries + authority",
    monthlyFocus: "Clarity in proposals"
  });
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    { id:"b1", title:"Designing the decision, not just the deliverable", slug:"designing-the-decision", body:"## The quiet after a quote\n\nIt's rarely about price. It's about structure.\n\n### Fix in one page\n\nList what is included, what is not, and the next step. Put price last. Watch response rates change.", excerpt:"Why proposal structure beats polishing the logo.", category:"Process", tags:["proposals","pricing"], status:"published", publishedAt: new Date(Date.now()-1000*60*60*24*7).toISOString(), createdAt: new Date(Date.now()-1000*60*60*24*8).toISOString(), coverUrl:"https://images.unsplash.com/photo-1499951360447-b19be2c0e1a8?w=800&q=80" }
  ]);
  const [snippets, setSnippets] = useState<Snippet[]>([
    { id:"s1", title:"Proposal checklist", language:"markdown", body:"- Included\n- Not included\n- Next step\n- Price last", tags:["proposal"], createdAt: new Date().toISOString() }
  ]);
  const [ideas, setIdeas] = useState<IdeaCard[]>([
    { id:"i1", title:"Carousel: anchoring in pricing", body:"Explain anchoring with before/after proposal order.", tags:["carousel","psychology"], createdAt: new Date().toISOString() },
    { id:"i2", title:"Essay: why quiet is feedback", body:"Client silence is data about clarity.", tags:["writing"], createdAt: new Date().toISOString() },
  ]);
  const [privateProfile, setPrivateProfile] = useState<PrivateProfile>({ details:{ met:"At the gallery opening — you laughed at my nerdy kerning joke.", loves:"Handwritten notes, late drives, your tea ritual", dates:"Anniversary: 14 Feb, Birthday: 22 Aug"}, pinHash:"1234"});
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([
    { id:"pm1", occasion:"morning", tone:"sweet", body:"Good morning, my favorite person —\n\nThinking of you and smiling. Thank you for being the calm I come home to.\n\nHere's to a gentle morning for you.\n\nYours, today and tomorrow. — U", createdAt: new Date(Date.now()-1000*60*60*24*2).toISOString(), favourite:true, sentAt: new Date(Date.now()-1000*60*60*24*2).toISOString() }
  ]);
  const [search, setSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage — v2 has no demo notes/todos
  useEffect(()=>{
    try {
      const rawV2 = localStorage.getItem("hub-station-v2");
      const raw = rawV2 || localStorage.getItem("hub-station-v1");
      const TEMPLATE_NOTE_IDS = new Set(["n1","n2","n3"]);
      const TEMPLATE_TODO_IDS = new Set(["t1","t2","t3"]);
      if(raw){
        const parsed = JSON.parse(raw);
        if(parsed.notes) setNotes(parsed.notes.filter((n: any)=> !TEMPLATE_NOTE_IDS.has(n.id)));
        if(parsed.drafts) setDrafts(parsed.drafts);
        if(parsed.todos) setTodos(parsed.todos.filter((t: any)=> !TEMPLATE_TODO_IDS.has(t.id)));
        if(parsed.voiceProfile) setVP(parsed.voiceProfile);
        if(parsed.linkedinCalendar) setLC(parsed.linkedinCalendar);
        if(parsed.instagramCalendar) setIC(parsed.instagramCalendar);
        if(parsed.blogPosts) setBlogPosts(parsed.blogPosts);
        if(parsed.snippets) setSnippets(parsed.snippets);
        if(parsed.ideas) setIdeas(parsed.ideas);
        if(parsed.privateProfile) setPrivateProfile(parsed.privateProfile);
        if(parsed.privateMessages) setPrivateMessages(parsed.privateMessages);
        // migrate old key to new so templates don't return
        if(!rawV2 && raw) {
          try { localStorage.removeItem("hub-station-v1"); } catch {}
        }
      } else {
        // seed calendars
        setLC(mockYearlyCalendar("linkedin").slice(0,30));
        setIC(mockYearlyCalendar("instagram").slice(0,30));
      }
    } catch {}
    setHydrated(true);
  },[]);

  useEffect(()=>{
    if(!hydrated) return;
    const payload = { notes, drafts, todos, voiceProfile, linkedinCalendar, instagramCalendar, blogPosts, snippets, ideas, privateProfile, privateMessages };
    localStorage.setItem("hub-station-v2", JSON.stringify(payload));
  }, [notes,drafts,todos,voiceProfile,linkedinCalendar,instagramCalendar,blogPosts,snippets,ideas,privateProfile,privateMessages,hydrated]);

  const addNote = (n:Note)=> setNotes(s=>[n, ...s]);
  const updateNote = (id:string, fn:(x:Note)=>Note)=> setNotes(s=> s.map(x=> x.id===id ? fn(x): x));
  const deleteNote = (id:string)=> setNotes(s=> s.map(n=> n.id===id ? {...n, deletedAt: new Date().toISOString()}: n));

  const addEntryToNote = (noteId:string, body:string, kind:"text"|"voice"="text", audioInfo?:any)=>{
    const entry: any = { id: Math.random().toString(36).slice(2,9), noteId, kind, body, createdAt: new Date().toISOString(), transcriptStatus: kind==="voice" ? "transcribing" : undefined, audioPath: audioInfo?.audioPath, audioDurationSec: audioInfo?.duration };
    setNotes(s=> s.map(n=> n.id===noteId ? {...n, entries:[...n.entries, entry], updatedAt: new Date().toISOString()} : n));
    if(kind==="voice"){
      setTimeout(()=>{
        setNotes(s=> s.map(n=> n.id===noteId ? {...n, entries: n.entries.map(e=> e.id===entry.id ? {...e, transcriptStatus:"done"}: e)}: n));
      }, 1200);
    }
  };

  const addDraft = (d:Draft)=> setDrafts(s=>[d, ...s]);
  const updateDraft = (id:string, fn:(x:Draft)=>Draft)=> setDrafts(s=> s.map(d=> d.id===id ? fn(d): d));
  const addTodo = (t:Todo)=> setTodos(s=>[t, ...s]);
  const updateTodo = (id:string, fn:(x:Todo)=>Todo)=> setTodos(s=> s.map(t=> t.id===id ? fn(t): t));
  const deleteTodo = (id:string)=> setTodos(s=> s.filter(t=> t.id!==id));
  const setVoiceProfile = (v:VoiceProfile)=> setVP(v);
  const setLinkedinCalendar = (c:CalendarSlot[])=> setLC(c);
  const setInstagramCalendar = (c:CalendarSlot[])=> setIC(c);
  const setInstagramPillars = (p:any)=> setIP(p);
  const addBlogPost = (b:BlogPost)=> setBlogPosts(s=>[b, ...s]);
  const updateBlogPost = (id:string, fn:(x:BlogPost)=>BlogPost)=> setBlogPosts(s=> s.map(b=> b.id===id ? fn(b): b));
  const addSnippet = (s:Snippet)=> setSnippets(prev=>[s, ...prev]);
  const addIdea = (i:IdeaCard)=> setIdeas(prev=>[i, ...prev]);
  const updateIdea = (id:string, fn:(x:IdeaCard)=>IdeaCard)=> setIdeas(prev=> prev.map(i=> i.id===id ? fn(i): i));
  const setPrivateProfileFn = (p:PrivateProfile)=> setPrivateProfile(p);
  const addPrivateMessage = (m:PrivateMessage)=> setPrivateMessages(s=>[m, ...s]);

  return <Ctx.Provider value={{ notes, drafts, todos, voiceProfile, linkedinCalendar, instagramCalendar, instagramPillars, blogPosts, snippets, ideas, privateProfile, privateMessages, search, addNote, updateNote, deleteNote, addEntryToNote, addDraft, updateDraft, addTodo, updateTodo, deleteTodo, setVoiceProfile, setLinkedinCalendar, setInstagramCalendar, setInstagramPillars, addBlogPost, updateBlogPost, addSnippet, addIdea, updateIdea, setPrivateProfile: setPrivateProfileFn, addPrivateMessage, setSearch, hydrated }}>{children}</Ctx.Provider>
}

export const useStore = ()=>{
  const c = useContext(Ctx);
  if(!c) throw new Error("no store");
  return c;
}
