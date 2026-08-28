import { NextRequest } from "next/server";
import { pickReply, REFERENCE_PREAMBLE } from "@/data/responses";
import type { Citation } from "@/lib/types";

export const dynamic = "force-dynamic";

type ChatRequest = {
  prompt?: string;
  presetVoice?: "balanced" | "concise" | "exploratory";
  references?: string[];
  attachments?: string[];
};

const encoder = new TextEncoder();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Splits into word-ish chunks while keeping whitespace attached, so the stream
 * reads like a model emitting tokens rather than a typewriter.
 */
function tokenize(text: string): string[] {
  return text.match(/\s*\S+|\s+$/g) ?? [];
}

function buildCitations(
  references: string[],
  attachments: string[],
): Citation[] {
  const citations: Citation[] = [];

  if (references.includes("knowledgeBase")) {
    citations.push(
      {
        id: "kb-1",
        label: "Polyaura Design Principles v3",
        source: "knowledge-base",
      },
      {
        id: "kb-2",
        label: "Web Type & Spacing Scale",
        source: "knowledge-base",
      },
    );
  }

  if (references.includes("campaignMemory")) {
    citations.push({
      id: "cm-1",
      label: "Q3 Brand Refresh — decisions log",
      source: "campaign-memory",
    });
  }

  for (const [index, name] of attachments.slice(0, 3).entries()) {
    citations.push({ id: `up-${index}`, label: name, source: "upload" });
  }

  return citations;
}

export async function POST(request: NextRequest) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return new Response("Malformed request body", { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return new Response("A prompt is required", { status: 400 });
  }

  const references = body.references ?? [];
  const attachments = body.attachments ?? [];
  const voice = body.presetVoice ?? "balanced";

  let reply = pickReply(prompt);

  const preamble = references
    .map((key) => REFERENCE_PREAMBLE[key])
    .filter(Boolean)
    .join("\n\n");
  if (preamble) reply = `${preamble}\n\n${reply}`;

  if (attachments.length > 0) {
    const list = attachments.map((name) => `\`${name}\``).join(", ");
    reply = `I've read ${
      attachments.length === 1
        ? "the attached file"
        : `all ${attachments.length} attached files`
    } (${list}) and factored ${attachments.length === 1 ? "it" : "them"} into this.\n\n${reply}`;
  }

  // The preset's voice only changes pacing here — there is no model to steer.
  const paceFloor = voice === "concise" ? 4 : voice === "exploratory" ? 12 : 8;

  const chunks = tokenize(reply);
  const citations = buildCitations(references, attachments);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      };

      try {
        // Latency before the first token, so the "thinking" state is visible.
        await sleep(320 + Math.random() * 240);

        let inFence = false;
        for (const chunk of chunks) {
          if (request.signal.aborted) break;

          send({ type: "delta", text: chunk });

          if (chunk.includes("```")) inFence = !inFence;
          // Code streams faster; prose gets a little jitter to feel organic.
          const delay = inFence
            ? paceFloor * 0.35
            : paceFloor + Math.random() * paceFloor * 1.5;
          await sleep(delay);
        }

        if (!request.signal.aborted) {
          if (citations.length > 0) send({ type: "citations", citations });
          send({ type: "done" });
        }
      } catch {
        send({
          type: "error",
          message: "The response stream was interrupted.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
