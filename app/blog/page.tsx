"use client";
import { useStore } from "@/lib/store";
import { mockBlogPost } from "@/lib/mockAI";
import { BookOpen, Code2, Lightbulb, Link as LinkIcon, FileText, Globe, Eye, Edit3, Plus, Search } from "lucide-react";
import { useState } from "react";

function fmtLagos(d: string){
  return new Intl.DateTimeFormat("en-GB",{ day:"numeric", month:"short", timeZone:"Africa/Lagos"}).format(new Date(d));
}
function fmtLagosTime(d: string){
  const day = new Intl.DateTimeFormat("en-GB",{ day:"numeric", month:"short", timeZone:"Africa/Lagos"}).format(new Date(d));
  const hm = new Intl.DateTimeFormat("en-GB",{ hour:"2-digit", minute:"2-digit", hour12:false, timeZone:"Africa/Lagos"}).format(new Date(d));
  return `${day} ${hm}`;
}

export default function BlogPage(){
  const { blogPosts, addBlogPost, updateBlogPost, snippets, addSnippet, ideas, addIdea, updateIdea, notes, addNote } = useStore();
  const [tab, setTab] = useState<"posts"|"vault"|"ideas">("posts");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [editingId, setEditingId] = useState<string|null>(null);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetLang, setSnippetLang] = useState("typescript");
  const [snippetBody, setSnippetBody] = useState("");
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaBody, setIdeaBody] = useState("");
  const [searchVault, setSearchVault] = useState("");

  const createPost = ()=>{
    if(!title.trim()) return;
    const s = slug || title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    const post:any = { id: editingId || Math.random().toString(36).slice(2,9), title, slug:s, body: body || mockBlogPost(notes[0]?.entries[0]?.body || "Draft body", title), excerpt: excerpt || body.slice(0,120), category, tags: tags.split(",").map(t=> t.trim()).filter(Boolean), status:"draft", createdAt: new Date().toISOString() };
    if(editingId){
      updateBlogPost(editingId, ()=> post);
      setEditingId(null);
    } else addBlogPost(post);
    setTitle(""); setSlug(""); setBody(""); setExcerpt(""); setCategory(""); setTags("");
  };

  const publish = (id:string)=>{
    updateBlogPost(id, (p)=> ({...p, status: p.status==="published"?"draft":"published", publishedAt: new Date().toISOString()}));
  };

  const filteredSnippets = snippets.filter(s=> !searchVault || (s.title+s.body+s.tags.join(" ")).toLowerCase().includes(searchVault.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display font-bold text-[28px] tracking-tight leading-none">Blog & vault</h1>
        <div className="ml-auto inline-flex rounded-full border border-border bg-white p-1">
          {[
            {k:"posts", l:"Blog posts", icon: BookOpen},
            {k:"vault", l:"Code vault", icon: Code2},
            {k:"ideas", l:"Ideas board", icon: Lightbulb},
          ].map(t=>(
            <button key={t.k} onClick={()=> setTab(t.k as any)} className={`h-8 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 ${tab===t.k ? "bg-ink text-white" : "text-ink-soft"}`}>
              <t.icon className="w-4 h-4" />{t.l}
            </button>
          ))}
        </div>
      </div>

      {tab==="posts" && (
        <>
          <div className="rounded-sheet bg-white border border-border shadow-card p-5">
            <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-ink-muted"/><h2 className="font-display font-semibold">{editingId?"Edit post":"New blog post"}</h2><span className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted ml-auto">Rich text · headings, images, code blocks</span></div>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="Title" className="h-10 px-3 rounded-control border border-border bg-surface-2/60 focus:bg-white text-[14px] focus:outline-none focus:border-tide-300 focus:ring-4 focus:ring-tide-100" />
              <input value={slug} onChange={e=> setSlug(e.target.value)} placeholder="slug (auto from title)" className="h-10 px-3 rounded-control border border-border bg-surface-2/60 text-[14px] mono focus:outline-none focus:border-tide-300" />
              <input value={category} onChange={e=> setCategory(e.target.value)} placeholder="Category" className="h-10 px-3 rounded-control border border-border bg-surface-2/60 text-[14px] focus:outline-none" />
              <input value={tags} onChange={e=> setTags(e.target.value)} placeholder="Tags, comma separated" className="h-10 px-3 rounded-control border border-border bg-surface-2/60 text-[14px] focus:outline-none" />
            </div>
            <input value={excerpt} onChange={e=> setExcerpt(e.target.value)} placeholder="Excerpt (short summary)" className="w-full mt-3 h-10 px-3 rounded-control border border-border bg-white text-[14px] focus:outline-none focus:border-tide-300" />
            <textarea value={body} onChange={e=> setBody(e.target.value)} rows={8} placeholder="Body — markdown supported. Paste a note or generate from it. Publishing writes to posts table that portfolio reads." className="w-full mt-3 rounded-card border border-border bg-surface-2/60 focus:bg-white p-3 text-[14px] leading-6 focus:outline-none focus:border-tide-300 focus:ring-4 focus:ring-tide-100" />
            <div className="flex gap-2 mt-3">
              <button onClick={createPost} className="h-9 px-4 rounded-full bg-ink text-white text-[13px] font-semibold inline-flex items-center gap-2"><Plus className="w-4 h-4"/>{editingId?"Update":"Create draft"}</button>
              <button onClick={()=>{ if(!title) setTitle(notes[0]?.title || "Designing the decision"); setBody(mockBlogPost(notes[0]?.entries.map(e=>e.body).join("\n")||"Note body", title || notes[0]?.title)); }} className="h-9 px-4 rounded-full border border-border bg-white text-[13px] font-medium">Generate from note</button>
              <button onClick={()=>{setTitle("");setSlug("");setBody("");setExcerpt("");setEditingId(null);}} className="h-9 px-4 rounded-full border border-border bg-white text-[13px]">Clear</button>
            </div>
            <p className="mono text-[11px] text-ink-muted mt-2">Publishing writes to <span className="bg-surface-2 px-1 py-0.5 rounded">posts</span> table. Portfolio reads from same Supabase project (default) or protected endpoint. Unpublish returns to draft.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {blogPosts.map(post=>(
              <div key={post.id} className="rounded-card border border-border bg-white overflow-hidden card-hover">
                {post.coverUrl && <img src={post.coverUrl} alt="" className="w-full h-[160px] object-cover" />}
                <div className="p-4">
                  <div className="flex items-center gap-2 mono text-[11px] tracking-[0.08em] uppercase text-ink-muted"><span className={`px-2 py-0.5 rounded-full border ${post.status==="published"?"bg-ink text-white border-ink": post.status==="scheduled"?"bg-amber-50 border-amber-200 text-amber-700":"bg-surface-2 border-border"}`}>{post.status}</span><span>{post.category || "general"}</span><span suppressHydrationWarning className="ml-auto">{post.publishedAt ? fmtLagos(post.publishedAt) : fmtLagos(post.createdAt)}</span></div>
                  <h3 className="font-display font-semibold text-[16px] leading-tight mt-2">{post.title}</h3>
                  <p className="text-[13px] leading-5 text-ink-soft mt-2 line-clamp-3">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-1 mt-2">{post.tags.map(t=> <span key={t} className="mono text-[10px] tracking-[0.06em] uppercase px-2 py-0.5 rounded-full border border-border bg-surface-2">{t}</span>)}</div>
                  <div className="flex gap-1 mt-3">
                    <button onClick={()=> publish(post.id)} className={`h-7 px-3 rounded-full text-[12px] font-medium inline-flex items-center gap-1 ${post.status==="published"?"bg-white border border-border text-ink":"bg-ink text-white"}`}><Globe className="w-3 h-3"/>{post.status==="published"?"Unpublish":"Publish"}</button>
                    <button onClick={()=>{ setTitle(post.title); setSlug(post.slug); setBody(post.body); setExcerpt(post.excerpt); setCategory(post.category||""); setTags(post.tags.join(", ")); setEditingId(post.id); window.scrollTo({top:0, behavior:"smooth"}); }} className="h-7 px-3 rounded-full border border-border bg-white text-[12px] inline-flex items-center gap-1"><Edit3 className="w-3 h-3"/>Edit</button>
                    <button className="h-7 px-3 rounded-full border border-border bg-white text-[12px] inline-flex items-center gap-1"><Eye className="w-3 h-3"/>Preview</button>
                  </div>
                  {post.status==="published" && <div className="mono text-[11px] text-success mt-2">Live on portfolio — appears within 1 minute</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab==="vault" && (
        <>
          <div className="rounded-card border border-border bg-white p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input value={searchVault} onChange={e=> setSearchVault(e.target.value)} placeholder="Search snippets by title, language, tags…" className="w-full h-10 pl-9 pr-3 rounded-full border border-border bg-surface-2/60 text-[14px] focus:outline-none focus:border-tide-300" />
            </div>
            <span className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">{filteredSnippets.length} snippets</span>
          </div>

          <div className="rounded-card bg-white border border-border p-5">
            <h3 className="font-display font-semibold flex items-center gap-2"><Code2 className="w-4 h-4 text-ink-muted"/>Save a snippet</h3>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <input value={snippetTitle} onChange={e=> setSnippetTitle(e.target.value)} placeholder="Title" className="h-10 px-3 rounded-control border border-border bg-surface-2/60 text-[14px] focus:outline-none" />
              <select value={snippetLang} onChange={e=> setSnippetLang(e.target.value)} className="h-10 px-3 rounded-control border border-border bg-white text-[13px]">
                <option>typescript</option><option>javascript</option><option>python</option><option>css</option><option>markdown</option><option>sql</option>
              </select>
              <button onClick={()=>{ if(!snippetTitle.trim()||!snippetBody.trim()) return; addSnippet({ id: Math.random().toString(36).slice(2,9), title: snippetTitle, language: snippetLang, body: snippetBody, tags:[snippetLang], createdAt: new Date().toISOString() }); setSnippetTitle(""); setSnippetBody(""); }} className="h-10 rounded-full bg-ink text-white text-[13px] font-semibold">Save</button>
            </div>
            <textarea value={snippetBody} onChange={e=> setSnippetBody(e.target.value)} rows={5} placeholder="Paste code here…" className="w-full mt-3 rounded-card border border-border bg-ink text-white mono text-[13px] p-3 focus:outline-none" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredSnippets.map(s=>(
              <div key={s.id} className="rounded-card border border-border bg-white overflow-hidden">
                <div className="h-9 border-b border-border flex items-center gap-2 px-3">
                  <span className="mono text-[11px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full bg-ink text-white">{s.language}</span>
                  <span className="text-[13px] font-medium truncate">{s.title}</span>
                  <span suppressHydrationWarning className="mono text-[11px] text-ink-muted ml-auto">{fmtLagos(s.createdAt)}</span>
                </div>
                <pre className="p-3 mono text-[12px] leading-5 bg-ink text-white overflow-auto max-h-[180px]">{s.body}</pre>
                <div className="p-2 flex gap-1 border-t border-border">
                  <button onClick={()=> navigator.clipboard.writeText(s.body)} className="h-7 px-3 rounded-full border border-border bg-white text-[12px]">Copy</button>
                  <span className="mono text-[11px] text-ink-muted self-center ml-auto">{s.tags.join(" · ")}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab==="ideas" && (
        <>
          <div className="rounded-card bg-white border border-border p-5">
            <h3 className="font-display font-semibold">Ideas board — cards → note</h3>
            <p className="text-[13px] text-ink-soft mt-1">Quick cards for design concepts, project ideas, write-up seeds. Any card converts to a note and keeps history.</p>
            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <input value={ideaTitle} onChange={e=> setIdeaTitle(e.target.value)} placeholder="Title" className="h-10 px-3 rounded-control border border-border bg-surface-2/60 text-[14px] focus:outline-none" />
              <input value={ideaBody} onChange={e=> setIdeaBody(e.target.value)} placeholder="Body / description" className="h-10 px-3 rounded-control border border-border bg-surface-2/60 text-[14px] focus:outline-none md:col-span-2" />
            </div>
            <button onClick={()=>{ if(!ideaTitle.trim()) return; addIdea({ id: Math.random().toString(36).slice(2,9), title: ideaTitle, body: ideaBody, tags:[], createdAt: new Date().toISOString() }); setIdeaTitle(""); setIdeaBody(""); }} className="mt-3 h-9 px-4 rounded-full bg-ink text-white text-[13px] font-semibold">Add card</button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {ideas.map(card=>(
              <div key={card.id} className="rounded-card border border-border bg-white p-4 card-hover">
                <div suppressHydrationWarning className="mono text-[11px] tracking-[0.08em] uppercase text-ink-muted">{fmtLagosTime(card.createdAt)}</div>
                <h4 className="font-display font-semibold text-[15px] mt-1">{card.title}</h4>
                <p className="text-[13px] leading-5 text-ink-soft mt-2">{card.body}</p>
                <div className="flex gap-1 mt-3">
                  <button onClick={()=>{
                    const nid = Math.random().toString(36).slice(2,9);
                    addNote({ id: nid, title: card.title, type:"idea", tags: card.tags, pinned:false, archived:false, deletedAt:null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), entries:[{ id: Math.random().toString(36).slice(2,9), noteId: nid, kind:"text", body: card.body, createdAt: new Date().toISOString() }] } as any);
                    updateIdea(card.id, c=> ({...c, convertedNoteId: nid}));
                  }} className="h-7 px-3 rounded-full bg-ink text-white text-[12px] inline-flex items-center gap-1"><LinkIcon className="w-3 h-3"/>{card.convertedNoteId?"Converted":"Convert to note"}</button>
                  {card.convertedNoteId && <span className="mono text-[11px] text-success self-center">→ note {card.convertedNoteId}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
