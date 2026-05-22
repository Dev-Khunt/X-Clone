import { Heart, MessageCircle, MoreHorizontal, Repeat2, Trash2 } from "lucide-react";
import { MouseEvent, useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { Tweet } from "../../types";
import { avatar, formatTime } from "../../utils/format";
import { navigate } from "../../utils/navigation";
import { useAuth } from "../../context/AuthContext";

export function TweetCard({
  tweet,
  onChanged,
  compact = false,
}: {
  tweet: Tweet;
  onChanged: () => void;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const isOwner = user?.username === tweet.username;

  // ─── Optimistic state ────────────────────────────────────────────────────────
  const [liked, setLiked] = useState(Boolean(tweet.isLiked));
  const [likeCount, setLikeCount] = useState(tweet.like_count ?? 0);
  const [retweeted, setRetweeted] = useState(Boolean(tweet.isRetweeted));
  const [retweetCount, setRetweetCount] = useState(tweet.retweet_count ?? 0);

  // Keep in sync when parent reloads tweet data
  useEffect(() => {
    setLiked(Boolean(tweet.isLiked));
    setLikeCount(tweet.like_count ?? 0);
    setRetweeted(Boolean(tweet.isRetweeted));
    setRetweetCount(tweet.retweet_count ?? 0);
  }, [tweet.isLiked, tweet.like_count, tweet.isRetweeted, tweet.retweet_count]);

  // ─── More-menu state ─────────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent | globalThis.MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // ─── Optimistic like toggle ───────────────────────────────────────────────────
  async function toggleLike(event: MouseEvent) {
    event.stopPropagation();
    const wasLiked = liked;
    // 1. Update UI instantly
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      // 2. Fire API in background
      if (wasLiked) {
        await api.delete(`/reactions/tweets/${tweet.tweet_id}`);
      } else {
        await api.post(`/reactions/tweets/${tweet.tweet_id}`);
      }
    } catch {
      // 3. Rollback on failure
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  }

  // ─── Optimistic retweet toggle ────────────────────────────────────────────────
  async function toggleRetweet(event: MouseEvent) {
    event.stopPropagation();
    const wasRetweeted = retweeted;
    // 1. Update UI instantly
    setRetweeted(!wasRetweeted);
    setRetweetCount((c) => (wasRetweeted ? c - 1 : c + 1));
    try {
      // 2. Fire API in background
      if (wasRetweeted) {
        await api.delete(`/retweets/${tweet.tweet_id}`);
      } else {
        await api.post(`/retweets/${tweet.tweet_id}`);
      }
    } catch {
      // 3. Rollback on failure
      setRetweeted(wasRetweeted);
      setRetweetCount((c) => (wasRetweeted ? c + 1 : c - 1));
    }
  }

  // ─── Delete tweet ─────────────────────────────────────────────────────────────
  async function deleteTweet(event: MouseEvent) {
    event.stopPropagation();
    setMenuOpen(false);
    await api.delete(`/tweets/${tweet.tweet_id}`);
    onChanged();
  }

  return (
    <article
      className="relative flex cursor-pointer gap-3 border-b border-zinc-200 p-4 transition-colors hover:bg-zinc-50/80 dark:border-zinc-800 dark:hover:bg-zinc-900/40"
      onClick={() => navigate(`/api/tweet/${tweet.tweet_id}`)}
    >
      <img className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-800" src={avatar(tweet)} alt="" />
      <div className="min-w-0 flex-1">
        {tweet.type === "retweet" && (
          <small className="mb-1 inline-flex items-center gap-1 text-emerald-500">
            <Repeat2 size={14} /> Retweeted
          </small>
        )}
        <div className="flex items-start justify-between gap-3 text-zinc-500">
          <button
            className="min-w-0 text-left"
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/api/users/${tweet.username}`);
            }}
            type="button"
          >
            <b className="mr-1 text-zinc-950 hover:underline dark:text-zinc-100">{tweet.display_name}</b>
            <span>@{tweet.username}</span>
          </button>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-sm">{formatTime(tweet.created_at)}</span>
            {/* ⋯ menu — only visible to tweet owner */}
            {isOwner && (
              <div ref={menuRef} className="relative">
                <button
                  className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                  type="button"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-9 z-50 min-w-[150px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
                    style={{ animation: "bugModalIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)" }}
                  >
                    <button
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={deleteTweet}
                      type="button"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed">{tweet.content}</p>

        {tweet.media_url && (
          tweet.media_type === "video" ? (
            <video
              className="mt-3 max-h-[520px] w-full rounded-2xl border border-zinc-200 object-cover dark:border-zinc-800"
              controls
              src={tweet.media_url}
            />
          ) : (
            <img
              className="mt-3 max-h-[520px] w-full rounded-2xl border border-zinc-200 object-cover dark:border-zinc-800"
              src={tweet.media_url}
              alt=""
            />
          )
        )}

        {!compact && (
          <div className="mt-3 flex max-w-sm justify-between text-zinc-500">
            {/* Retweet */}
            <ActionButton
              active={retweeted}
              color="emerald"
              onClick={toggleRetweet}
              label="Retweet"
              icon={<Repeat2 size={18} />}
              count={retweetCount}
            />
            {/* Like */}
            <ActionButton
              active={liked}
              color="pink"
              onClick={toggleLike}
              label="Like"
              icon={<Heart size={18} fill={liked ? "currentColor" : "none"} />}
              count={likeCount}
            />
            {/* Comment count (read-only) */}
            <span className="inline-flex items-center gap-2 p-1">
              <MessageCircle size={18} />
              <span className="text-sm tabular-nums">{tweet.comment_count || 0}</span>
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

function ActionButton({
  active,
  color,
  onClick,
  label,
  icon,
  count,
}: {
  active: boolean;
  color: "emerald" | "pink";
  onClick: (e: MouseEvent) => void;
  label: string;
  icon: React.ReactNode;
  count: number;
}) {
  const colorClasses = {
    emerald: active ? "text-emerald-500" : "hover:text-emerald-500",
    pink: active ? "text-pink-500" : "hover:text-pink-500",
  };
  const bgClasses = {
    emerald: "hover:bg-emerald-500/10",
    pink: "hover:bg-pink-500/10",
  };

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full p-1.5 transition-colors ${colorClasses[color]} ${bgClasses[color]}`}
      onClick={onClick}
      type="button"
      aria-label={label}
    >
      {icon}
      <span className="text-sm tabular-nums">{count || 0}</span>
    </button>
  );
}
