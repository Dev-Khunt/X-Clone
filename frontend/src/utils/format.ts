import { StoredUser } from "../types";

export function avatar(user?: Pick<StoredUser, "username" | "profile_image"> | null) {
  return user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}&background=222&color=fff`;
}

export function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const secs = Math.max(0, Math.floor(diff / 1000));
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (secs < 60) return `${secs}s`;
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
