import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { CommentCard } from "../components/tweet/CommentCard";
import { TweetCard } from "../components/tweet/TweetCard";
import { EmptyState } from "../components/ui/EmptyState";
import api from "../services/api";
import { CommentItem, Tweet } from "../types";
import { useAuth } from "../context/AuthContext";
import { avatar, formatTime } from "../utils/format";

export function TweetDetail({ tweetId }: { tweetId: number }) {
  const { user } = useAuth();
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);

  async function loadTweet() {
    const { data: rows } = await api.get<Tweet[]>(`/tweets/${tweetId}`);
    setTweet(rows[0]);
    const { data: comments } = await api.get<CommentItem[]>(`/comments/tweet/${tweetId}`);
    setComments(comments);
  }

  async function postComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("content") as HTMLInputElement;
    if (!input.value.trim()) return;
    await api.post(`/comments/${tweetId}`, { content: input.value });
    input.value = "";
    loadTweet();
  }

  useEffect(() => { loadTweet().catch(console.error); }, [tweetId]);

  return (
    <>
      <Header
        title="Tweet"
        left={
          <button
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
            onClick={() => history.back()}
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
        }
      />
      {tweet ? <TweetCard tweet={tweet} onChanged={loadTweet} /> : <EmptyState text="Loading tweet..." />}
      <form className="flex gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800" onSubmit={postComment}>
        <img className="h-10 w-10 flex-shrink-0 rounded-full object-cover" src={avatar(user)} alt="" />
        <input
          className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-transparent px-4 py-2 outline-none focus:border-sky-500 dark:border-zinc-800"
          name="content"
          placeholder="Post your reply"
        />
        <button className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 font-bold text-white hover:bg-sky-600">
          <Send size={16} /> Reply
        </button>
      </form>
      {comments.length === 0 && <EmptyState text="No comments yet" />}
      {comments.map((comment) => (
        <ThreadedComment key={comment.comment_id} comment={comment} refresh={loadTweet} currentUser={user} />
      ))}
    </>
  );
}

// ─── Threaded comment with owner-only delete and full reply cards ─────────────

type CurrentUser = { username: string; user_id?: number; display_name?: string; profile_image?: string | null } | null;

function ThreadedComment({
  comment,
  refresh,
  currentUser,
}: {
  comment: CommentItem;
  refresh: () => void;
  currentUser: CurrentUser;
}) {
  const [replies, setReplies] = useState<CommentItem[]>([]);
  const [replyOpen, setReplyOpen] = useState(false);

  async function loadReplies() {
    const { data } = await api.get<CommentItem[]>(`/comments/replies/${comment.comment_id}`);
    setReplies(data);
  }

  async function postReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("reply") as HTMLInputElement;
    if (!input.value.trim()) return;
    await api.post(`/comments/reply/${comment.comment_id}`, { content: input.value });
    input.value = "";
    setReplyOpen(false);
    loadReplies();
  }

  async function deleteComment() {
    await api.delete(`/comments/${comment.comment_id}`);
    refresh();
  }

  async function deleteReply(replyId: number) {
    await api.delete(`/comments/${replyId}`);
    loadReplies();
  }

  useEffect(() => { loadReplies().catch(console.error); }, [comment.comment_id]);

  const isCommentOwner = currentUser?.username === comment.username;

  return (
    <CommentCard comment={comment}>
      <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
        <button className="hover:text-sky-500" onClick={() => setReplyOpen((v) => !v)} type="button">
          Reply
        </button>
        {/* Only show Delete if the logged-in user owns this comment */}
        {isCommentOwner && (
          <button
            className="flex items-center gap-1 text-red-400 hover:text-red-600"
            onClick={deleteComment}
            type="button"
          >
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>

      {/* Reply input (1 level only) */}
      {replyOpen && (
        <form className="mt-3 flex gap-2" onSubmit={postReply}>
          <img className="h-8 w-8 flex-shrink-0 rounded-full object-cover" src={avatar(currentUser)} alt="" />
          <input
            className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-zinc-800"
            name="reply"
            placeholder={`Reply to @${comment.username}…`}
          />
          <button className="rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600">
            Reply
          </button>
        </form>
      )}

      {/* Replies — full user cards, 1 level deep */}
      {replies.length > 0 && (
        <div className="mt-3 space-y-0 border-l-2 border-zinc-200 pl-4 dark:border-zinc-800">
          {replies.map((reply) => (
            <ReplyCard
              key={reply.comment_id}
              reply={reply}
              currentUser={currentUser}
              onDelete={() => deleteReply(reply.comment_id)}
            />
          ))}
        </div>
      )}
    </CommentCard>
  );
}

// ─── Individual reply card ────────────────────────────────────────────────────

function ReplyCard({
  reply,
  currentUser,
  onDelete,
}: {
  reply: CommentItem;
  currentUser: CurrentUser;
  onDelete: () => void;
}) {
  const isOwner = currentUser?.username === reply.username;

  return (
    <div className="flex gap-2 py-3">
      <img className="h-8 w-8 flex-shrink-0 rounded-full object-cover" src={avatar(reply)} alt="" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <b>{reply.display_name}</b>
          <span className="text-zinc-500">@{reply.username}</span>
          {reply.created_at && (
            <span className="ml-auto shrink-0 text-xs text-zinc-500">{formatTime(reply.created_at)}</span>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm">{reply.content}</p>
        {isOwner && (
          <button
            className="mt-1 flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
            onClick={onDelete}
            type="button"
          >
            <Trash2 size={11} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}
