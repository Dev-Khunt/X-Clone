import { ReactNode } from "react";
import { XLogo } from "../ui/XLogo";
import { navigate } from "../../utils/navigation";

export function Header({ title, left }: { title: string; left?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-zinc-200/80 bg-white/80 px-4 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-black/80">
      {left || (
        <button className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 md:hidden" onClick={() => navigate("/home")} type="button">
          <XLogo className="h-6 w-6" />
        </button>
      )}
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
    </header>
  );
}
