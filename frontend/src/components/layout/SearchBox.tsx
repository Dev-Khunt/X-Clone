import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";
import { SearchResult, StoredUser, Tweet } from "../../types";
import { avatar } from "../../utils/format";
import { navigate } from "../../utils/navigation";

export function SearchBox({ onResultClick }: { onResultClick?: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = window.setTimeout(() => {
      api<SearchResult>(`/search?q=${encodeURIComponent(query)}`).then(setResults).catch(console.error);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside the search box
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setResults(null);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeResults() {
    setResults(null);
    setQuery("");
    onResultClick?.();
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex min-h-12 items-center gap-3 rounded-full bg-zinc-100 px-4 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500 dark:bg-[#202327] dark:focus-within:bg-black">
        <Search size={18} className="shrink-0 text-zinc-500" />
        <input
          className="w-full bg-transparent outline-none placeholder:text-zinc-500"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
        />
      </div>
      {results && (
        <div className="absolute left-0 right-0 top-14 z-40 max-h-[430px] overflow-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <SearchSection title="People" />
          {results.users.map((user) => (
            <UserResult key={user.username} user={user} onNavigate={closeResults} />
          ))}
          <SearchSection title="Tweets" />
          {results.tweets.map((tweet) => (
            <TweetResult key={tweet.tweet_id} tweet={tweet} onNavigate={closeResults} />
          ))}
          {!results.users.length && !results.tweets.length && (
            <p className="p-5 text-center text-sm text-zinc-500">No results found</p>
          )}
        </div>
      )}
    </div>
  );
}

function SearchSection({ title }: { title: string }) {
  return <h4 className="px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</h4>;
}

function UserResult({ user, onNavigate }: { user: StoredUser; onNavigate: () => void }) {
  return (
    <button
      className="flex w-full items-center gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900"
      onClick={() => { onNavigate(); navigate(`/api/users/${user.username}`); }}
      type="button"
    >
      <img className="h-10 w-10 rounded-full object-cover" src={avatar(user)} alt="" />
      <span className="grid min-w-0">
        <b className="truncate">{user.display_name}</b>
        <small className="truncate text-zinc-500">@{user.username}</small>
      </span>
    </button>
  );
}

function TweetResult({ tweet, onNavigate }: { tweet: Tweet; onNavigate: () => void }) {
  return (
    <button
      className="block w-full border-b border-zinc-100 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900"
      onClick={() => { onNavigate(); navigate(`/api/tweet/${tweet.tweet_id}`); }}
      type="button"
    >
      <b>{tweet.display_name}</b> <small className="text-zinc-500">@{tweet.username}</small>
      <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{tweet.content}</p>
    </button>
  );
}
