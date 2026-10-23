"use client";

/**
 * Chat Settings panel: preset picker, reference toggles with per-source
 * visibility, and the workspace upload list. Docks as a column or floats as an
 * overlay depending on viewport width.
 */
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, Info, Upload, Waypoints, X } from "lucide-react";
import { useRef } from "react";
import { Dropdown } from "@/components/ui/dropdown";
import { glassClass } from "@/components/ui/glass";
import { IconButton } from "@/components/ui/icon-button";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip } from "@/components/ui/tooltip";
import { PRESETS } from "@/data/seed";
import type { UploadedDoc } from "@/lib/types";
import { cn, fileKind, formatBytes, uid } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-faint">
      {children}
    </h3>
  );
}

type SettingsPanelProps = {
  /** Renders the panel as an overlay once the layout is too narrow to host a
   * third column. */
  floating?: boolean;
};

export function SettingsPanel({ floating }: SettingsPanelProps) {
  const open = useChatStore((state) => state.settingsOpen);
  const setSettingsOpen = useChatStore((state) => state.setSettingsOpen);
  const references = useChatStore((state) => state.references);
  const toggleReference = useChatStore((state) => state.toggleReference);
  const toggleReferenceVisibility = useChatStore(
    (state) => state.toggleReferenceVisibility,
  );
  const activePresetId = useChatStore((state) => state.activePresetId);
  const setPreset = useChatStore((state) => state.setPreset);
  const uploads = useChatStore((state) => state.uploads);
  const addUploads = useChatStore((state) => state.addUploads);
  const removeUpload = useChatStore((state) => state.removeUpload);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const docs: UploadedDoc[] = Array.from(files).map((file) => ({
      id: uid("doc"),
      name: file.name,
      size: file.size,
      kind: fileKind(file.name),
      addedAt: Date.now(),
    }));
    addUploads(docs);
  };

  const header = (
    <header className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line px-6">
      <h2 className="text-lg font-bold tracking-tight text-ink">
        Chat Settings
      </h2>
      <IconButton
        label="Close chat settings"
        onClick={() => setSettingsOpen(false)}
      >
        <X className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.9} />
      </IconButton>
    </header>
  );

  const body = (
    <div
      tabIndex={0}
      className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto"
    >
      <section className="border-b border-line px-6 py-5">
        <SectionLabel>Reference</SectionLabel>

        <div className="mt-4">
          <label className="mb-1.5 block text-[13.5px] font-medium text-ink-soft">
            Chat preset
          </label>
          <Dropdown
            label="Chat preset"
            value={activePresetId}
            onChange={setPreset}
            options={PRESETS.map((preset) => ({
              id: preset.id,
              label: preset.name,
              description: preset.description,
            }))}
            adornment={
              <Waypoints
                className="h-4 w-4 shrink-0 text-ink-faint"
                strokeWidth={1.9}
              />
            }
          />
        </div>

        <ul className="mt-5 flex flex-col gap-4">
          {references.map((reference) => (
            <li
              key={reference.key}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Toggle
                  checked={reference.enabled}
                  onChange={() => toggleReference(reference.key)}
                  label={`Toggle ${reference.label}`}
                />
                <span className="truncate text-[14px] font-medium text-ink">
                  {reference.label}
                </span>
                <Tooltip label={reference.hint} side="top">
                  <span className="flex text-ink-faint transition-colors hover:text-ink-muted">
                    <Info className="h-3.5 w-3.5" />
                  </span>
                </Tooltip>
              </div>

              <Tooltip
                label={
                  reference.visible ? "Sources shown inline" : "Sources hidden"
                }
                side="left"
              >
                <button
                  type="button"
                  disabled={!reference.enabled}
                  onClick={() => toggleReferenceVisibility(reference.key)}
                  aria-label={`Toggle source visibility for ${reference.label}`}
                  aria-pressed={reference.visible}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                >
                  {reference.visible ? (
                    <Eye
                      className="h-[1.05rem] w-[1.05rem]"
                      strokeWidth={1.8}
                    />
                  ) : (
                    <EyeOff
                      className="h-[1.05rem] w-[1.05rem]"
                      strokeWidth={1.8}
                    />
                  )}
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-6 py-5">
        <SectionLabel>Uploads</SectionLabel>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFiles(event.dataTransfer.files);
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white py-3 text-[14px] font-medium text-ink transition-colors hover:border-brand-ring hover:bg-brand-soft/40"
        >
          <Upload className="h-4 w-4 text-ink-muted" strokeWidth={1.9} />
          Upload docs
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <ul className="mt-3 flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {uploads.map((doc) => (
              <motion.li
                key={doc.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-muted"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-[10px] font-bold text-ink-soft">
                  {doc.kind}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {doc.name}
                  </span>
                  <span className="block text-[11.5px] text-ink-muted">
                    {formatBytes(doc.size)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeUpload(doc.id)}
                  aria-label={`Remove ${doc.name}`}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-faint opacity-0 transition-all hover:bg-white hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        {uploads.length === 0 && (
          <p className="mt-3 px-2 text-[13px] leading-relaxed text-ink-muted">
            Nothing uploaded yet. Add a PDF or spec and polyaura will read it
            before answering.
          </p>
        )}
      </section>
    </div>
  );

  if (floating) {
    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSettingsOpen(false)}
              className="glass-veil absolute inset-0 z-40"
            />
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Chat settings"
              className={cn(
                glassClass("panel"),
                "absolute bottom-[7rem] right-3 top-4 z-40 flex w-[21rem] max-w-[86vw] flex-col overflow-hidden rounded-2xl",
              )}
            >
              {header}
              {body}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          key="settings"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "23rem", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 h-full shrink-0 overflow-hidden pb-[6.5rem]"
          aria-label="Chat settings"
        >
          <div className="flex h-full w-[23rem] flex-col border-l border-line bg-surface">
            {header}
            {body}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
