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
    if(editingId){ updateBlogPost(editingId, ()=> post); setEditingId(null); } else addBlogPost(post);
    setTitle(""); setSlug(""); setBody(""); setExcerpt(""); setCategory(""); setTags("");
  };
  const publish = (id:string)=>{
    updateBlogPost(id, (p)=> ({...p, status: p.status==="published"?"draft":"published", publishedAt: new Date().toISOString()}));
  };
  const filteredSnippets = snippets.filter(s=> !searchVault || (s.title+s.body+s.tags.join(" ")).toLowerCase().includes(searchVault.toLowerCase()));

  const inputCls = "h-10 px-3 rounded-[12px] border border-line bg-surface-flat text-ink placeholder:text-ink-muted text-[14px] focus:outline-none focus:border-ink/20 focus:bg-surface";
  const textAreaCls = "w-full rounded-[24px] border border-line bg-surface-flat p-3 text-[14px] leading-6 text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink/20 focus:bg-surface";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight leading-none text-ink">Blog & vault</h1>
          <p className="text-[13px] text-ink-muted mt-1">Posts, snippets and ideas live here. Portfolio reads from the same posts table.</p>
        </div>
        <div className="ml-auto inline-flex rounded-full border border-line bg-surface p-1">
          {[
            {k:"posts", l:"Blog posts", icon: BookOpen},
            {k:"vault", l:"Code vault", icon: Code2},
            {k:"ideas", l:"Ideas board", icon: Lightbulb},
          ].map(t=>(
            <button key={t.k} onClick={()=> setTab(t.k as any)} className={`h-8 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 ${tab===t.k ? "bg-ink text-surface" : "text-ink-muted"}`}>
              <t.icon className="w-4 h-4" />{t.l}
            </button>
          ))}
        </div>
      </div>

      {tab==="posts" && (
        <>
          <div className="rounded-[24px] bg-surface border border-line p-6">
            <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-ink-muted"/><h2 className="font-medium text-ink">{editingId?"Edit post":"New blog post"}</h2><span className="text-[11px] tracking-widest uppercase text-ink-muted ml-auto">Rich text · headings, images, code blocks</span></div>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="Title" className={inputCls} />
              <input value={slug} onChange={e=> setSlug(e.target.value)} placeholder="slug (auto from title)" className={inputCls} />
              <input value={category} onChange={e=> setCategory(e.target.value)} placeholder="Category" className={inputCls} />
              <input value={tags} onChange={e=> setTags(e.target.value)} placeholder="Tags, comma separated" className={inputCls} />
            </div>
            <input value={excerpt} onChange={e=> setExcerpt(e.target.value)} placeholder="Excerpt (short summary)" className={`w-full mt-3 ${inputCls}`} />
            <textarea value={body} onChange={e=> setBody(e.target.value)} rows={8} placeholder="Body — markdown supported. Paste a note or generate from it." className={`mt-3 ${textAreaCls}`} />
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={createPost} className="h-9 px-4 rounded-full bg-ink text-surface text-[13px] font-medium inline-flex items-center gap-2"><Plus className="w-4 h-4"/>{editingId?"Update":"Create draft"}</button>
              <button onClick={()=>{ if(!title) setTitle(notes[0]?.title || "Designing the decision"); setBody(mockBlogPost(notes[0]?.entries.map(e=>e.body).join("\n")||"Note body", title || notes[0]?.title)); }} className="h-9 px-4 rounded-full border border-line bg-surface text-ink text-[13px]">Generate from note</button>
              <button onClick={()=>{setTitle("");setSlug("");setBody("");setExcerpt("");setEditingId(null);}} className="h-9 px-4 rounded-full border border-line bg-surface text-ink text-[13px]">Clear</button>
            </div>
            <p className="text-[12px] text-ink-muted mt-3">Publishing writes to <span className="bg-surface-flat px-1.5 py-0.5 rounded border border-line">posts</span> table. Portfolio reads from the same project. Unpublish returns to draft.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {blogPosts.map(post=>(
              <div key={post.id} className="rounded-[24px] border border-line bg-surface overflow-hidden flex flex-col">
                {post.coverUrl && <img src={post.coverUrl} alt="" className="w-full h-[160px] object-cover border-b border-line" />}
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase">
                    <span className={`px-2.5 py-1 rounded-full border text-[11px] font-medium ${post.status==="published"?"bg-ink text-surface border-ink": post.status==="scheduled"?"bg-amber-50 border-amber-200 text-ink":"bg-surface-flat border-line text-ink-muted"}`}>{post.status}</span>
                    <span className="text-ink-muted">{post.category || "general"}</span>
                    <span suppressHydrationWarning className="ml-auto text-ink-muted">{post.publishedAt ? fmtLagos(post.publishedAt) : fmtLagos(post.createdAt)}</span>
                  </div>
                  <h3 className="font-medium text-[16px] leading-tight mt-3 text-ink">{post.title}</h3>
                  <p className="text-[13px] leading-5 text-ink-muted mt-2 line-clamp-3">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">{post.tags.map(t=> <span key={t} className="text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full border border-line bg-surface-flat text-ink">{t}</span>)}</div>
                  <div className="flex gap-1.5 mt-4">
                    <button onClick={()=> publish(post.id)} className={`h-7 px-3 rounded-full text-[12px] font-medium inline-flex items-center gap-1 ${post.status==="published"?"bg-surface border border-line text-ink":"bg-ink text-surface"}`}><Globe className="w-3 h-3"/>{post.status==="published"?"Unpublish":"Publish"}</button>
                    <button onClick={()=>{ setTitle(post.title); setSlug(post.slug); setBody(post.body); setExcerpt(post.excerpt); setCategory(post.category||""); setTags(post.tags.join(", ")); setEditingId(post.id); window.scrollTo({top:0, behavior:"smooth"}); }} className="h-7 px-3 rounded-full border border-line bg-surface text-ink text-[12px] inline-flex items-center gap-1"><Edit3 className="w-3 h-3"/>Edit</button>
                    <button className="h-7 px-3 rounded-full border border-line bg-surface text-ink text-[12px] inline-flex items-center gap-1"><Eye className="w-3 h-3"/>Preview</button>
                  </div>
                  {post.status==="published" && <div className="text-[11px] text-teal mt-3 font-medium">Live on portfolio — appears within 1 minute</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab==="vault" && (
        <>
          <div className="rounded-[24px] border border-line bg-surface p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input value={searchVault} onChange={e=> setSearchVault(e.target.value)} placeholder="Search snippets by title, language, tags…" className="w-full h-10 pl-9 pr-3 rounded-full border border-line bg-surface-flat text-ink placeholder:text-ink-muted text-[14px] focus:outline-none focus:border-ink/20 focus:bg-surface" />
            </div>
            <span className="text-[11px] tracking-widest uppercase text-ink-muted">{filteredSnippets.length} snippets</span>
          </div>

          <div className="rounded-[24px] bg-surface border border-line p-6">
            <h3 className="font-medium flex items-center gap-2 text-ink"><Code2 className="w-4 h-4 text-ink-muted"/>Save a snippet</h3>
            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <input value={snippetTitle} onChange={e=> setSnippetTitle(e.target.value)} placeholder="Title" className={inputCls} />
              <select value={snippetLang} onChange={e=> setSnippetLang(e.target.value)} className="h-10 px-3 rounded-[12px] border border-line bg-surface text-ink text-[13px]">
                <option>typescript</option><option>javascript</option><option>python</option><option>css</option><option>markdown</option><option>sql</option>
              </select>
              <button onClick={()=>{ if(!snippetTitle.trim()||!snippetBody.trim()) return; addSnippet({ id: Math.random().toString(36).slice(2,9), title: snippetTitle, language: snippetLang, body: snippetBody, tags:[snippetLang], createdAt: new Date().toISOString() }); setSnippetTitle(""); setSnippetBody(""); }} className="h-10 rounded-full bg-ink text-surface text-[13px] font-medium">Save</button>
            </div>
            <textarea value={snippetBody} onChange={e=> setSnippetBody(e.target.value)} rows={5} placeholder="Paste code here…" className={`mt-3 bg-ink text-surface border-ink placeholder:text-white/60 ${textAreaCls}`} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredSnippets.map(s=>(
              <div key={s.id} className="rounded-[24px] border border-line bg-surface overflow-hidden">
                <div className="h-10 border-b border-line flex items-center gap-2 px-4 bg-surface-flat">
                  <span className="text-[11px] tracking-widest uppercase px-2.5 py-1 rounded-full bg-ink text-surface">{s.language}</span>
                  <span className="text-[13px] font-medium truncate text-ink">{s.title}</span>
                  <span suppressHydrationWarning className="text-[11px] text-ink-muted ml-auto">{fmtLagos(s.createdAt)}</span>
                </div>
                <pre className="p-4 text-[12px] leading-5 bg-ink text-surface overflow-auto max-h-[180px]">{s.body}</pre>
                <div className="p-2 flex gap-1 border-t border-line bg-surface">
                  <button onClick={()=> navigator.clipboard.writeText(s.body)} className="h-7 px-3 rounded-full border border-line bg-surface text-ink text-[12px]">Copy</button>
                  <span className="text-[11px] text-ink-muted self-center ml-auto">{s.tags.join(" · ")}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab==="ideas" && (
        <>
          <div className="rounded-[24px] bg-surface border border-line p-6">
            <h3 className="font-medium text-ink">Ideas board — cards → note</h3>
            <p className="text-[13px] text-ink-muted mt-1">Quick cards for design concepts, project ideas, write-up seeds. Any card converts to a note and keeps history.</p>
            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <input value={ideaTitle} onChange={e=> setIdeaTitle(e.target.value)} placeholder="Title" className={inputCls} />
              <input value={ideaBody} onChange={e=> setIdeaBody(e.target.value)} placeholder="Body / description" className={`${inputCls} md:col-span-2`} />
            </div>
            <button onClick={()=>{ if(!ideaTitle.trim()) return; addIdea({ id: Math.random().toString(36).slice(2,9), title: ideaTitle, body: ideaBody, tags:[], createdAt: new Date().toISOString() }); setIdeaTitle(""); setIdeaBody(""); }} className="mt-3 h-9 px-4 rounded-full bg-ink text-surface text-[13px] font-medium">Add card</button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {ideas.map(card=>(
              <div key={card.id} className="rounded-[24px] border border-line bg-surface p-5">
                <div suppressHydrationWarning className="text-[11px] tracking-widest uppercase text-ink-muted">{fmtLagosTime(card.createdAt)}</div>
                <h4 className="font-medium text-[15px] mt-2 text-ink">{card.title}</h4>
                <p className="text-[13px] leading-5 text-ink-muted mt-2">{card.body}</p>
                <div className="flex gap-1 mt-4 items-center">
                  <button onClick={()=>{
                    const nid = Math.random().toString(36).slice(2,9);
                    addNote({ id: nid, title: card.title, type:"idea", tags: card.tags, pinned:false, archived:false, deletedAt:null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), entries:[{ id: Math.random().toString(36).slice(2,9), noteId: nid, kind:"text", body: card.body, createdAt: new Date().toISOString() }] } as any);
                    updateIdea(card.id, c=> ({...c, convertedNoteId: nid}));
                  }} className="h-7 px-3 rounded-full bg-ink text-surface text-[12px] inline-flex items-center gap-1"><LinkIcon className="w-3 h-3"/>{card.convertedNoteId?"Converted":"Convert to note"}</button>
                  {card.convertedNoteId && <span className="text-[11px] text-teal self-center">→ note {card.convertedNoteId}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
