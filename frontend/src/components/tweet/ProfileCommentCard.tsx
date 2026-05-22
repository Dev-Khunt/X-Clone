import { MessageCircle } from "lucide-react";
import { CommentWithTweet } from "../../types";
import { avatar, formatTime } from "../../utils/format";
import { navigate } from "../../utils/navigation";

/**
 * Renders a user's comment in the Profile → Comments tab.
 * Shows the parent tweet (dimmed, clickable) above the comment for context.
 *
 *  ┌─ [Tweet author] @handle · time ─────────────────────┐
 *  │   tweet content (truncated)                          │
 *  └──────────────────────────────────────────────────────┘
 *     └─ [Commenter] @handle · time
 *           comment content
 */
export function ProfileCommentCard({ comment }: { comment: CommentWithTweet }) {
  return (
    <article className="border-b border-zinc-200 dark:border-zinc-800">
      {/* Parent tweet context */}
      <button
        className="flex w-full gap-3 px-4 pt-4 pb-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-950/60"
        onClick={() => navigate(`/api/tweet/${comment.tweet_id}`)}
        type="button"
        aria-label="Go to original tweet"
      >
        <img
          className="h-9 w-9 flex-shrink-0 rounded-full object-cover opacity-70"
          src={avatar({ username: comment.tweet_username, profile_image: comment.tweet_profile_image })}
          alt=""
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">
              {comment.tweet_display_name || comment.tweet_username}
            </span>
            <span>@{comment.tweet_username}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">{comment.tweet_content}</p>
        </div>
      </button>

      {/* Hierarchy connector */}
      <div className="flex gap-3 px-4">
        {/* Left thread line */}
        <div className="flex flex-col items-center" style={{ width: "36px" }}>
          <div className="w-0.5 flex-1 bg-zinc-300 dark:bg-zinc-700" style={{ minHeight: "12px" }} />
        </div>
        <div className="flex-1" />
      </div>

      {/* The user's comment */}
      <div className="flex gap-3 px-4 pb-4 pt-1">
        <img
          className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
          src={avatar(comment)}
          alt=""
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <b>{comment.display_name}</b>
            <span className="text-zinc-500">@{comment.username}</span>
            {comment.created_at && (
              <span className="ml-auto shrink-0 text-zinc-500">{formatTime(comment.created_at)}</span>
            )}
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm">{comment.content}</p>
        </div>
      </div>

      {/* Subtle label */}
      <div className="flex items-center gap-1 px-4 pb-3 text-xs text-zinc-400">
        <MessageCircle size={12} /> Replying to @{comment.tweet_username}
      </div>
    </article>
  );
}
