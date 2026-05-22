import { XLogo } from "../components/ui/XLogo";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { navigate } from "../utils/navigation";

export function Landing() {
  return (
    <main className="grid min-h-screen bg-white text-zinc-950 dark:bg-black dark:text-zinc-100 md:grid-cols-2">
      <section className="hidden place-items-center bg-black text-white dark:bg-black md:grid">
        <XLogo className="h-[28vw] max-h-80 w-[28vw] max-w-80" />
      </section>
      <section className="flex min-h-screen flex-col justify-center px-6 py-10 md:max-w-xl md:px-10">
        <div className="mb-8 flex items-center justify-between">
          <XLogo />
          <ThemeToggle />
        </div>
        <h1 className="mb-6 text-5xl font-black leading-tight md:text-7xl">Happening now</h1>
        <h2 className="mb-8 text-3xl font-bold">Join today.</h2>
        <button className="min-h-12 rounded-full bg-zinc-950 px-8 font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-black" onClick={() => navigate("/auth/signup")} type="button">
          Create account
        </button>
        <p className="mt-5 text-zinc-500">
          Already have an account? <button className="text-sky-500 hover:underline" onClick={() => navigate("/auth/signin")} type="button">Sign in</button>
        </p>
      </section>
    </main>
  );
}
