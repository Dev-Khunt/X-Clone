import { Bell, Bug, Home, LogOut, Search, User } from "lucide-react";
import { ReactNode, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { avatar } from "../../utils/format";
import { navigate } from "../../utils/navigation";
import { SearchBox } from "./SearchBox";
import { ThemeToggle } from "./ThemeToggle";
import { XLogo } from "../ui/XLogo";
import { BugReportModal } from "../ui/BugReportModal";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [bugModalOpen, setBugModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  function signOut() {
    logout();
    navigate("/auth/signin");
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-[1320px] bg-white text-zinc-950 dark:bg-black dark:text-zinc-100 lg:grid-cols-[275px_minmax(0,600px)_350px] md:grid-cols-[88px_minmax(0,1fr)]">
      <aside className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 px-2 py-1 backdrop-blur-md dark:border-zinc-800 dark:bg-black/95 md:sticky md:top-0 md:h-screen md:border-t-0 md:border-r md:border-zinc-200/50 md:p-3 dark:md:border-zinc-800/50">
        <div className="hidden md:block">
          <button className="grid h-14 w-14 place-items-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900" onClick={() => navigate("/home")} type="button">
            <XLogo />
          </button>
        </div>
        <nav className="flex justify-around md:mt-4 md:grid md:gap-1">
          <NavButton icon={<Home size={25} />} label="Home" onClick={() => navigate("/home")} />
          <NavButton icon={<Search size={25} />} label="Search" onClick={() => setSearchOpen((v) => !v)} />
          <NavButton icon={<User size={25} />} label="Profile" onClick={() => user && navigate(`/api/users/${user.username}`)} />
          <NavButton icon={<Bug size={25} />} label="Report Bug" onClick={() => setBugModalOpen(true)} variant="bug" />
        </nav>

        {/* Inline search dropdown — left sidebar, visible on md+ */}
        {searchOpen && (
          <div className="mt-2 hidden md:block">
            <SearchBox onResultClick={() => setSearchOpen(false)} />
          </div>
        )}

        <div className="mt-auto hidden md:block">
          <button className="mt-8 flex w-full items-center gap-3 rounded-full p-3 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900" onClick={() => user && navigate(`/api/users/${user.username}`)} type="button">
            <img className="h-11 w-11 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-800" src={avatar(user)} alt="" />
            <span className="hidden min-w-0 lg:grid">
              <b className="truncate">{user?.display_name || "User"}</b>
              <small className="truncate text-zinc-500">@{user?.username}</small>
            </span>
          </button>
          <button className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-2 text-red-500 transition-colors hover:bg-red-500/10" onClick={signOut} type="button">
            <LogOut size={18} /> <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen border-x border-zinc-200 pb-16 dark:border-zinc-800 md:pb-0">{children}</main>

      <aside className="sticky top-0 hidden h-screen space-y-4 px-4 py-3 lg:block">
        <div className="flex items-center justify-end gap-3">
          <ThemeToggle />
        </div>
        <section className="rounded-2xl bg-zinc-50 p-4 dark:bg-[#16181c]">
          <h2 className="mb-4 text-xl font-bold">What's happening</h2>
          <div className="space-y-3 text-sm">
            <TrendItem tag="Technology" posts="12.4K" />
            <TrendItem tag="AI" posts="8.7K" />
            <TrendItem tag="Startups" posts="5.2K" />
            <TrendItem tag="Coding" posts="3.1K" />
          </div>
        </section>
      </aside>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-white p-4 dark:bg-black md:hidden">
          <div className="mb-3 flex items-center gap-3">
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
              onClick={() => setSearchOpen(false)}
              type="button"
            >
              ✕
            </button>
            <div className="flex-1">
              <SearchBox onResultClick={() => setSearchOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {bugModalOpen && <BugReportModal onClose={() => setBugModalOpen(false)} />}
    </div>
  );
}

function NavButton({ icon, label, onClick, variant }: { icon: ReactNode; label: string; onClick?: () => void; variant?: string }) {
  const isBug = variant === "bug";
  return (
    <button
      className={`group inline-flex items-center gap-4 rounded-full p-3 text-lg transition-colors md:w-14 md:justify-center lg:w-auto lg:justify-start ${
        isBug
          ? "text-zinc-500 hover:bg-orange-500/10 hover:text-orange-500 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className={`transition-transform group-hover:scale-110 ${isBug ? "" : ""}`}>{icon}</span>
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function TrendItem({ tag, posts }: { tag: string; posts: string }) {
  return (
    <div className="cursor-pointer rounded-lg px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
      <p className="font-semibold text-zinc-900 dark:text-zinc-100">#{tag}</p>
      <p className="text-xs text-zinc-500">{posts} posts</p>
    </div>
  );
}
