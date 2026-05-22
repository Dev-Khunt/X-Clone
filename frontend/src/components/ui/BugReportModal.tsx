import { useState, useRef } from "react";
import { X, ImagePlus, Trash2, CheckCircle2, Bug } from "lucide-react";

const BUG_AREAS = [
  { value: "home", label: "Home / Feed" },
  { value: "tweet", label: "Tweet / Post" },
  { value: "search", label: "Search" },
  { value: "profile", label: "Profile" },
  { value: "comments", label: "Comments / Replies" },
  { value: "notifications", label: "Notifications" },
  { value: "auth", label: "Sign In / Sign Up" },
  { value: "other", label: "Other" },
];

export function BugReportModal({ onClose }: { onClose: () => void }) {
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleScreenshot(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setScreenshot(null);
      setPreviewUrl(null);
    }
  }

  function removeScreenshot() {
    handleScreenshot(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit() {
    if (!area || !description.trim()) return;
    setSubmitting(true);

    // Simulate submission (replace with real API call when backend endpoint exists)
    await new Promise((r) => setTimeout(r, 800));

    setSubmitting(false);
    setSubmitted(true);

    // Auto-close after showing success
    setTimeout(() => onClose(), 1600);
  }

  const isValid = area && description.trim().length >= 10;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        style={{ animation: "bugModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white">
            <Bug size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">Report a Bug</h3>
            <p className="text-xs text-zinc-500">Help us improve your experience</p>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500" style={{ animation: "bugScaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)" }}>
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-xl font-bold">Thank you!</h4>
            <p className="text-sm text-zinc-500">Your bug report has been submitted successfully.</p>
          </div>
        ) : (
          /* ── Form ── */
          <div className="space-y-5 px-5 py-5">
            {/* Area selector */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Where did you find the bug? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BUG_AREAS.map((item) => (
                  <button
                    key={item.value}
                    className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                      area === item.value
                        ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-sm shadow-sky-500/10"
                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                    }`}
                    onClick={() => setArea(item.value)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Describe the bug <span className="text-red-500">*</span>
              </label>
              <textarea
                className="min-h-28 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-sky-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-600 dark:focus:border-sky-500 dark:focus:bg-zinc-950"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us what happened, what you expected, and steps to reproduce..."
              />
              <p className="mt-1 text-xs text-zinc-400">
                {description.trim().length < 10
                  ? `At least 10 characters required (${description.trim().length}/10)`
                  : `${description.trim().length} characters`}
              </p>
            </div>

            {/* Screenshot (optional) */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Screenshot <span className="text-xs font-normal text-zinc-400">(optional)</span>
              </label>
              {previewUrl ? (
                <div className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <img
                    src={previewUrl}
                    alt="Bug screenshot"
                    className="max-h-48 w-full object-cover"
                  />
                  <button
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                    onClick={removeScreenshot}
                    type="button"
                    aria-label="Remove screenshot"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-400 transition-colors hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-500 dark:border-zinc-700 dark:hover:border-sky-600 dark:hover:bg-sky-950/20 dark:hover:text-sky-400"
                  onClick={() => fileRef.current?.click()}
                  type="button"
                >
                  <ImagePlus size={20} />
                  Click to add a screenshot
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleScreenshot(e.target.files?.[0] || null)}
              />
            </div>

            {/* Submit */}
            <button
              className="w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:shadow-xl hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              disabled={!isValid || submitting}
              onClick={handleSubmit}
              type="button"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                "Submit Bug Report"
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
