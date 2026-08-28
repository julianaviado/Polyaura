/**
 * Domain types shared across the store, components, and the API route.
 */

export type Role = "user" | "assistant";

export type AttachmentStatus = "uploading" | "ready" | "error";

export type Attachment = {
  id: string;
  name: string;
  /** Size in bytes. */
  size: number;
  /** Short uppercase badge label, e.g. "PDF". */
  kind: string;
  status: AttachmentStatus;
  /** 0–100, only meaningful while `status === "uploading"`. */
  progress: number;
};

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  attachments: Attachment[];
  /** True while the assistant reply is still being streamed in. */
  streaming?: boolean;
  /** Set when generation was stopped by the user. */
  stopped?: boolean;
  /** Set when the mock backend failed, so the UI can offer a retry. */
  error?: string;
  /** Assistant turns keep the sources the reference toggles pulled in. */
  citations?: Citation[];
};

export type Citation = {
  id: string;
  label: string;
  source: "knowledge-base" | "campaign-memory" | "upload";
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  pinned?: boolean;
};

export type ReferenceKey =
  | "knowledgeBase"
  | "campaignMemory"
  | "thirdPartyModels";

export type ReferenceToggle = {
  key: ReferenceKey;
  label: string;
  hint: string;
  enabled: boolean;
  /** The eye control in the mockup: whether matched sources are shown inline. */
  visible: boolean;
};

export type Preset = {
  id: string;
  name: string;
  description: string;
  /** Tone hint the mock engine uses to colour its replies. */
  voice: "balanced" | "concise" | "exploratory";
};

export type UploadedDoc = {
  id: string;
  name: string;
  size: number;
  kind: string;
  addedAt: number;
};

export type SavedItem = {
  id: string;
  conversationId: string;
  messageId: string;
  title: string;
  excerpt: string;
  savedAt: number;
};
