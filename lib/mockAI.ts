// Server-side mock AI generation - deterministic templates that feel human

export function mockTranscription(sampleIndex=0){
  const samples = [
    "So I was thinking about why clients go quiet after a quote — it's usually unclear scope, no next step, and price before value. Maybe turn this into a carousel that walks through each one with a quick fix.",
    "Morning voice note: psychology class on cognitive bias yesterday — anchoring explains why the first number you hear sticks. Could link this to pricing presentations for the LinkedIn post.",
    "Idea for the brand board: use the Tide and Amber balance — 74 neutral, 16 tide, 10 amber. Keep surfaces calm, reserve warm for action.",
    "Quick task: send invoice to the Lekki client before 3pm. Follow up on the editorial layout too.",
    "Love note draft: thank you for the way you listen — even when I'm rambling about kerning at midnight, you make it feel important.",
  ];
  return samples[sampleIndex % samples.length];
}

const linkedinHooks = [
  "A quiet lesson from last week:",
  "I used to think this was about talent. It wasn't.",
  "Three reasons projects stall — and none is budget:",
  "Behind the scenes in the studio yesterday:",
  "Psychology taught me this about design:",
  "A client's silence told me everything:",
];

const linkedinBodies = [
  "Scope was vague. Next step was missing. Price arrived before value. When we fixed the first two, the third stopped being a problem.\n\nWe now send every quote with: (1) what is included, (2) what is not, (3) the one next step. No deck. Just clarity.\n\nIf your proposals end in quiet, check those three lines first.",
  "I kept polishing the logo. The client wanted to feel understood.\n\nThe turn was a 10-minute call where I repeated their goals in their words. The work didn't change. Trust did.\n\nDesign is often translation before it is form.",
  "In class we studied anchoring — the first number frames every number after it. So I moved price to the end of the proposal and led with outcome. Same price, different reception.\n\nOrder is a design choice, even in documents.",
];

const humanBodiesByLength: Record<number, string[]> = {
  50: [
    "Last month a client went quiet after my quote. I re-read it — vague scope, no next step, price first. I rewrote one page: included / not included / next step. She replied in 20 minutes. Sometimes clarity is the kindest close.",
    "I used to hide price at the bottom. Now I lead with outcome, then steps, then price. Same numbers, warmer reception. Order tells a story — make price the last line, not the first.",
  ],
  100: [
    "Tuesday, 2:13pm. Quote sent. Wednesday, no reply. Old me would have discounted.\n\nInstead I opened the doc and asked: would a tired founder know what they're buying? They wouldn't.\n\nSo I rebuilt it: One page. What we’ll do (in your words). What we won’t. The one next step — a 15-minute review on Thursday. Price lives at the end, after value is felt.\n\nShe replied: 'This is clear. Let's do Thursday.' Lesson: people don’t ghost on price. They pause on confusion.",
    "In my second year I learned anchoring — the first number you see frames all others. I was showing price before context, so price became the anchor.\n\nNow I walk clients through the story: their goal, how we’ll get there, what success looks like in 6 weeks. By the time we reach numbers, they’ve already pictured the result. Conversations got lighter. Revisions dropped. It wasn’t talent. It was sequence.",
  ],
  200: [
    "I keep a sticky note from 2023: 'They didn’t say no. They didn’t understand.' It’s from the week I lost a project I really wanted.\n\nI’d sent a beautiful deck — moodboards, palette, type. The reply never came. A friend who’s a founder said: 'Uneek, I skimmed it at 10pm between school run and dinner. I couldn’t find what I’d get, or what to do next. I closed it.'\n\nThat stung, then it shaped me.\n\nNow every quote is a tiny story:\n\n→ Hook: Their exact words back to them — 'You want Lekki mothers to trust the brand before they taste it.'\n→ Middle: Three honest lines: Here’s what’s included (shoot, edit, rollout), what’s not (media buying), and the one next step (a 20-minute review Thursday 11am WAT). No catalogue of deliverables.\n→ Anchor: Price at the very end, after value has landed. Same price as before, different frame.\n\nLast month I quoted the same way and heard: 'This feels considered. When do we start?' Same work. Kinder container.\n\nIf your proposals end in quiet, check the three lines before price. Clarity is an act of respect — and respect converts. What’s one proposal you can re-order tonight?",
  ],
};

// expand/trim to hit word target approximately
function fitWords(text: string, target: number) {
  const words = text.trim().split(/\s+/);
  if (words.length <= target + 8) return text; // already within range
  if (words.length > target) {
    // trim but keep paragraph breaks
    return words.slice(0, target).join(" ") + "…";
  }
  // if too short, pad with gentle closer
  const pad = "\n\nP.S. Writing this at my desk in Lagos — 11am, kettle on. If this helped, save it for your next quote.";
  return text + pad;
}

// Build LinkedIn post from *user's actual note text* — this is key for social formatting feature.
// Even 2-3 lines should be turned into a platform story.
export function formatNoteForSocial(noteText: string, platform: "linkedin" | "instagram", wordTarget: number = 100) {
  const clean = (noteText || "").trim();
  if (!clean) return "";
  if (platform === "linkedin") {
    // human story framing using user text, not just random
    // Take first sentence as hook seed
    const firstLine = clean.split("\n")[0].slice(0, 120);
    const hook = `I wrote this to myself last night:\n\n“${firstLine}”`;
    const story = humanBodiesByLength[wordTarget as any]?.[0] || humanBodiesByLength[100][0];
    // weave user text in the middle
    const body = `${hook}\n\n${clean}\n\nHere’s what I’m learning:\n\n${story}`;
    return fitWords(body, wordTarget);
  } else {
    // instagram carousel caption style
    const title = clean.split("\n")[0].slice(0, 56);
    return `Slide 1 — ${title}\n\n${clean}\n\nSwipe for the 3 fixes →\n\n#BrandDesign #ClientExperience #UneekDesigns`;
  }
}

export function mockLinkedInPost(profile: any, slot: any, noteText?: string, wordCount: number = 100){
  // if noteText provided, prioritize it (social formatting feature)
  if (noteText && noteText.trim().length > 10) {
    const p1 = formatNoteForSocial(noteText, "linkedin", wordCount);
    const p2 = p1 + "\n\n—\nBuilt with Hub Station. Voice → draft in under a minute.";
    return [p1, p2];
  }
  const hook = linkedinHooks[Math.floor(Math.random()*linkedinHooks.length)];
  // pick body matching length bucket
  const bucket = wordCount <= 60 ? 50 : wordCount <= 130 ? 100 : 200;
  const pool = humanBodiesByLength[bucket] || humanBodiesByLength[100];
  const body = pool[Math.floor(Math.random()*pool.length)];
  const p1 = `${hook}\n\n${body}`;
  const p2 = `${hook.replace(":"," — a note to myself:")}\n\n${body}\n\nP.S. Building Hub Station to capture these daily — voice to draft in under a minute.`;
  return [fitWords(p1, wordCount), fitWords(p2, wordCount)];
}

export function mockBlogPost(noteText: string, titleHint?: string){
  const title = titleHint || "Why quiet proposals are not about price";
  return `# ${title}\n\n${noteText}\n\n## The pattern\n\nThree things show up whenever a project goes silent: unclear scope, no defined next step, and price placed before value. Each is fixable in a single page.\n\n## What we changed\n\nWe rewrote the proposal to answer three questions first: What is included? What is not? What happens next? Only then did we talk numbers. The language stayed Tide-calm, the action stayed Amber-warm.\n\n## Takeaway\n\nIf you want fewer ghosted quotes, design the decision, not just the deliverable.`;
}

export function mockCarouselOutline(noteText: string){
  return {
    title: "3 reasons clients go quiet (and fixes)",
    slides: [
      { n:1, text: "Why clients go quiet after a quote", note: "Cover — Tide background, large type" },
      { n:2, text: "1. Scope is vague — 'brand design' means different things", note: "Show two lists: vague vs specific" },
      { n:3, text: "2. No next step — the ball is in no one's court", note: "Visual: calendar step" },
      { n:4, text: "3. Price before value — anchoring in action", note: "Before/after order" },
      { n:5, text: "Fix: Included / Not included / Next step", note: "Checklist slide" },
      { n:6, text: "Save this for your next proposal →", note: "CTA, amber dot" },
    ],
    caption: "Proposal silence is rarely about money. It's about clarity. Save this checklist — your next quote will thank you.",
    hashtags: ["#BrandDesign", "#ClientExperience", "#ProposalTips", "#UneekDesigns"]
  };
}

export function mockPrivateMessage(occasion:string, tone:string, profile:any){
  const map: Record<string,string[]> = {
    sweet: ["Good morning, my favorite person —", "Thinking of you and smiling —", "You make ordinary days feel chosen —"],
    playful: ["Okay, but how are you this cute before coffee?", "Quick poll: who loves who more today? I volunteer as tribute.", "Be honest — did you put extra kindness in my day again?"],
    deep: ["There are days work is loud. You are the quiet I come home to —", "Loving you has taught me patience in a way no course ever did —",],
    formal: ["My love,", "My dearest,",],
  };
  const openers = map[tone] || map.sweet;
  const o = openers[Math.floor(Math.random()*openers.length)];
  const mids = [
    "thank you for the way you listen, even when I'm mid-kerning rant. Your 'mm-hmm' is my favorite soundcheck.",
    "yesterday with you reminded me: joy doesn't need a reason. It just needs you, present.",
    "I love how you remember the small things — the way I take tea, the name of that client I'm nervous about. You notice. I notice you noticing.",
  ];
  const closings = ["Yours, today and tomorrow. — U", "Forever your teammate. — Uneek", "All my love, Uneek ♡"];
  const mid = mids[Math.floor(Math.random()*mids.length)];
  const close = closings[Math.floor(Math.random()*closings.length)];
  return `${o}\n\n${mid}\n\n${occasion !== "morning" ? `Happy ${occasion} — I hope this finds you soft and smiling.` : "Here's to a gentle morning for you."}\n\n${close}`;
}

export function mockYearlyCalendar(channel:"linkedin"|"instagram"){
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const linkedinAngles = ["Story: studio lesson","Lesson: proposal clarity","Behind the scenes: process","Opinion: design ethics","Case study: brand turnaround","Psychology meets design: anchoring"];
  const igAngles = ["Showcase: finished brand","Process: sketch to final","Education: typography","Client attraction: how to brief a designer","Personality: studio notes"];
  const out: any[] = [];
  const start = new Date();
  start.setHours(0,0,0,0);
  // generate 365 slots for linkedin, 52 weeks * 3 posts for instagram ~ but simplify to 365 as well grouped
  for(let i=0;i<365;i++){
    const d = new Date(start); d.setDate(start.getDate()+i);
    const iso = d.toISOString().slice(0,10);
    const isLinked = channel==="linkedin";
    const pool = isLinked ? linkedinAngles : igAngles;
    const angle = pool[i % pool.length];
    const [postTypeRaw, topicRaw] = angle.split(": ");
    const postType = postTypeRaw.toLowerCase().replace(/\s/g,"-");
    out.push({
      id: `${channel}-${iso}`,
      channel,
      date: iso,
      topic: topicRaw,
      angle: angle,
      postType: postType as any,
      locked: i<3 ? true : false,
    });
  }
  return out;
}

export function mockWeeklyInstagramIdeas(){
  return [
    { hook: "This brand looked premium until the proposal.", idea: "Showcase: before/after pricing page redesign", pillar: "Showcase", format: "carousel", caption: "The proposal is part of the brand. Here's how we reordered it." },
    { hook: "Your brief is not a test.", idea: "Education: 5 lines a good brief always answers", pillar: "Education", format: "carousel", caption: "Steal this brief check — clients will thank you." },
    { hook: "Studio confessions at 11pm.", idea: "Personality: psychology class sketchbook", pillar: "Personality", format: "reel", caption: "What anchoring taught me about pricing — in 30s." },
    { hook: "How we move from sketch to system.", idea: "Process: Uneek Designs brand board timelapse", pillar: "Process", format: "carousel", caption: "4 iterations you didn't see. Swipe." },
    { hook: "Ready to work together?", idea: "Client attraction: How to work with Uneek — 3 steps", pillar: "Client attraction", format: "single", caption: "Clarity first, proposal second, work third. DM 'START'." },
  ];
}
