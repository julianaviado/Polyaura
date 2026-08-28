"use client";

import { Modal } from "@/components/ui/modal";
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from "@/data/legal";
import { useChatStore } from "@/store/chat-store";

/** Renders whichever legal document the account menu opened, if any. */
export function LegalModal() {
  const legalOpen = useChatStore((state) => state.legalOpen);
  const setLegalOpen = useChatStore((state) => state.setLegalOpen);

  const document =
    legalOpen === "terms"
      ? TERMS_OF_SERVICE
      : legalOpen === "privacy"
        ? PRIVACY_POLICY
        : null;

  return (
    <Modal
      open={document !== null}
      onClose={() => setLegalOpen(null)}
      title={document?.title ?? ""}
      description={document ? `Effective ${document.effectiveDate}` : undefined}
      className="max-w-2xl"
    >
      {document && (
        <div className="flex flex-col gap-5 px-6 py-5">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="text-[14px] font-semibold text-ink">
                {section.heading}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      )}
    </Modal>
  );
}
