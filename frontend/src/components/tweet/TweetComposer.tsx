import { Image, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { avatar } from "../../utils/format";

export function TweetComposer({ onPosted }: { onPosted: () => void }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function postTweet() {
    if (!content.trim() && !file) return;

    const body = new FormData();
    body.append("content", content);
    if (file) body.append("tweet", file);

    setBusy(true);
    try {
      await api.post("/tweets", body);
      setContent("");
      setFile(null);
      onPosted();
    } finally {
      setBusy(false);
    }
  }

  const charCount = content.length;
  const maxChars = 280;
  const isOverLimit = charCount > maxChars;

  return (
    <section className="flex gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
      <img className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800" src={avatar(user)} alt="" />
      <div className="min-w-0 flex-1">
        <textarea
          className="min-h-24 w-full resize-y bg-transparent text-xl outline-none placeholder:text-zinc-400"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What is happening?!"
        />
        {file && (
          <div className="group relative mt-3">
            <img className="max-h-[420px] w-full rounded-2xl border border-zinc-200 object-cover dark:border-zinc-800" src={URL.createObjectURL(file)} alt="" />
            <button
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
              onClick={() => setFile(null)}
              type="button"
              aria-label="Remove media"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-sky-500 transition-colors hover:bg-sky-500/10" title="Add media">
              <Image size={20} />
              <input hidden type="file" accept="image/*,video/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>
            {charCount > 0 && (
              <span className={`text-xs tabular-nums ${isOverLimit ? "text-red-500 font-semibold" : "text-zinc-400"}`}>
                {charCount}/{maxChars}
              </span>
            )}
          </div>
          <button
            className="rounded-full bg-sky-500 px-5 py-2 font-bold text-white shadow-md shadow-sky-500/20 transition-all hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/30 disabled:opacity-50 disabled:shadow-none"
            disabled={busy || (!content.trim() && !file) || isOverLimit}
            onClick={postTweet}
            type="button"
          >
            {busy ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </section>
  );
}
