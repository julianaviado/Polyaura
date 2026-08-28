import type { Attachment } from "@/lib/types";
import { fileKind, uid } from "@/lib/utils";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function attachmentFromFile(file: File): Attachment {
  return {
    id: uid("att"),
    name: file.name,
    size: file.size,
    kind: fileKind(file.name),
    status: file.size > MAX_UPLOAD_BYTES ? "error" : "uploading",
    progress: 0,
  };
}

/**
 * There is no upload endpoint in the demo, so progress is simulated. Returns a
 * cancel function so callers can stop the ticker when a chip is removed.
 */
export function simulateUpload(
  attachment: Attachment,
  onProgress: (id: string, progress: number) => void,
  onDone: (id: string) => void,
) {
  if (attachment.status === "error") return () => undefined;

  let progress = 0;
  const interval = setInterval(() => {
    progress = Math.min(100, progress + 12 + Math.random() * 22);
    onProgress(attachment.id, progress);
    if (progress >= 100) {
      clearInterval(interval);
      onDone(attachment.id);
    }
  }, 130);

  return () => clearInterval(interval);
}
