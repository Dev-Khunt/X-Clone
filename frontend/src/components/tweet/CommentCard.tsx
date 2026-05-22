import { ReactNode } from "react";
import { CommentItem } from "../../types";
import { avatar, formatTime } from "../../utils/format";

export function CommentCard({ comment, children }: { comment: CommentItem; children?: ReactNode }) {
  return (
    <article className="flex gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
      <img className="h-11 w-11 flex-shrink-0 rounded-full object-cover" src={avatar(comment)} alt="" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <b className="truncate">{comment.display_name}</b>
          <span className="text-zinc-500">@{comment.username}</span>
          {comment.created_at && (
            <span className="ml-auto shrink-0 text-sm text-zinc-500">{formatTime(comment.created_at)}</span>
          )}
        </div>
        <p className="mt-2 whitespace-pre-wrap break-words">{comment.content}</p>
        {children}
      </div>
    </article>
  );
}
