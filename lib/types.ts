export type NoteType = "idea" | "write-up" | "code" | "design" | "personal";
export type NoteEntryKind = "text" | "voice";
export type TranscriptStatus = "idle" | "transcribing" | "done" | "failed";

export interface NoteEntry {
  id: string;
  noteId: string;
  kind: NoteEntryKind;
  body: string;
  createdAt: string; // ISO
  editedAt?: string;
  audioPath?: string;
  audioDurationSec?: number;
  transcriptStatus?: TranscriptStatus;
}

export interface Note {
  id: string;
  title: string;
  type: NoteType;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  entries: NoteEntry[];
}

export type DraftChannel = "linkedin" | "blog" | "instagram";
export type DraftStatus = "draft" | "ready" | "posted";
export interface Draft {
  id: string;
  sourceNoteId: string | null;
  channel: DraftChannel;
  title?: string;
  body: string;
  status: DraftStatus;
  createdAt: string;
  variants?: string[];
}

export type TodoPriority = "low" | "med" | "high";
export type TodoStatus = "open" | "done";
export interface Todo {
  id: string;
  title: string;
  notes?: string;
  dueAt?: string; // ISO
  remindAt?: string[]; // ISO array
  priority: TodoPriority;
  status: TodoStatus;
  completedAt?: string;
  repeat?: "none" | "daily" | "weekly" | "weekdays" | "monthly";
  tags?: string[];
  linkedNoteId?: string;
  snoozedUntil?: string;
  createdAt: string;
}

export interface VoiceProfile {
  answers: Record<string,string>;
  styleGuide: string;
  samples: string[];
  updatedAt: string;
}

export interface CalendarSlot {
  id: string;
  channel: "linkedin" | "instagram";
  date: string; // YYYY-MM-DD
  topic: string;
  angle: string;
  postType: "story" | "lesson" | "behind-the-scenes" | "opinion" | "case-study" | "psychology-meets-design" | "showcase" | "process" | "education" | "client" | "personality";
  locked?: boolean;
  draftId?: string;
}

export interface PrivateProfile {
  details: Record<string,string>;
  pinHash?: string; // simple hash mock
}

export interface PrivateMessage {
  id: string;
  occasion: string;
  tone: string;
  body: string;
  favourite?: boolean;
  sentAt?: string;
  createdAt: string;
}

export interface Snippet {
  id: string;
  title: string;
  language: string;
  body: string;
  tags: string[];
  createdAt: string;
}

export interface IdeaCard {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  convertedNoteId?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  coverUrl?: string;
  category?: string;
  tags: string[];
  status: "draft" | "scheduled" | "published";
  publishedAt?: string;
  createdAt: string;
}
