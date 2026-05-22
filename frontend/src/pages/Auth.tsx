import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Repeat2 } from "lucide-react";
import { XLogo } from "../components/ui/XLogo";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { COUNTRIES } from "../utils/constants";
import { navigate } from "../utils/navigation";

type Captcha = { id: number; image: string; text: string };

export function Signin() {
  const { login } = useAuth();
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setLoading(true);

    try {
      const data = await api<any>("/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.get("identifier"),
          password: form.get("password"),
          captchaId: captcha?.id,
          captchaText: captcha?.text,
        }),
      });

      login(data.accessToken, {
        user_id: data.user_id,
        username: data.username,
        display_name: data.display_name,
        profile_image: data.profile_image,
      });
      navigate("/home");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="Sign in to X">
      <form className="grid gap-5" onSubmit={submit}>
        <AuthField label="Email or username" name="identifier" required />
        <AuthField label="Password" name="password" type="password" required />
        <CaptchaBox captcha={captcha} setCaptcha={setCaptcha} />
        <button className="min-h-12 rounded-full bg-zinc-950 font-bold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error && <p className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <p className="text-zinc-500">Don't have an account? <button className="text-sky-500 hover:underline" onClick={() => navigate("/auth/signup")} type="button">Sign up</button></p>
      </form>
    </AuthScreen>
  );
}

export function Signup() {
  const [captcha, setCaptcha] = useState<Captcha | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setMessage("");

    try {
      await api("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(form.entries()),
          captchaId: captcha?.id,
          captchaText: captcha?.text,
        }),
      });

      setMessage("Account created. Redirecting to sign in...");
      window.setTimeout(() => navigate("/auth/signin"), 900);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <AuthScreen title="Create your account">
      <form className="grid gap-5" onSubmit={submit}>
        <AuthField label="Display Name" name="display_name" required />
        <AuthField label="Email" name="email" type="email" required />
        <AuthField label="Username" name="username" required />
        <AuthField label="Password" name="password" type="password" required />
        <AuthField label="Date of Birth" name="dob" type="date" required />
        <select className="border-b border-zinc-300 bg-transparent px-0 py-4 outline-none focus:border-sky-500 dark:border-zinc-700" name="country" required>
          <option value="">Select your country</option>
          {COUNTRIES.map(([value, name]) => <option key={value} value={value}>{name}</option>)}
        </select>
        <CaptchaBox captcha={captcha} setCaptcha={setCaptcha} />
        <button className="min-h-12 rounded-full bg-zinc-950 font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-black">Create account</button>
        {message && <p className="rounded-lg border border-emerald-500 bg-emerald-500/10 p-3 text-sm text-emerald-500">{message}</p>}
        {error && <p className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <p className="text-zinc-500">Already have an account? <button className="text-sky-500 hover:underline" onClick={() => navigate("/auth/signin")} type="button">Sign in</button></p>
      </form>
    </AuthScreen>
  );
}

function AuthScreen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white text-zinc-950 dark:bg-black dark:text-zinc-100 md:grid-cols-2">
      <aside className="hidden place-items-center md:grid"><XLogo className="h-[28vw] max-h-80 w-[28vw] max-w-80" /></aside>
      <section className="flex min-h-screen flex-col justify-center px-6 py-10 md:max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <XLogo />
          <ThemeToggle />
        </div>
        <h1 className="mb-8 text-3xl font-bold">{title}</h1>
        {children}
      </section>
    </main>
  );
}

function AuthField(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="relative block">
      <input className="peer w-full border-b border-zinc-300 bg-transparent px-0 pb-2 pt-6 outline-none focus:border-sky-500 dark:border-zinc-700" placeholder=" " {...props} />
      <span className="pointer-events-none absolute left-0 top-4 text-zinc-500 transition-all peer-focus:-translate-y-4 peer-focus:text-xs peer-focus:text-sky-500 peer-[:not(:placeholder-shown)]:-translate-y-4 peer-[:not(:placeholder-shown)]:text-xs">{props.label}</span>
    </label>
  );
}

function CaptchaBox({ captcha, setCaptcha }: { captcha: Captcha | null; setCaptcha: (captcha: Captcha) => void }) {
  async function loadCaptcha() {
    const data = await api<{ captchaId: number; captcha: string }>("/auth/captcha");
    setCaptcha({ id: data.captchaId, image: data.captcha, text: "" });
  }

  useEffect(() => { loadCaptcha().catch(console.error); }, []);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        {captcha?.image && <img className="h-12 rounded border border-zinc-200 dark:border-zinc-800" src={captcha.image} alt="Captcha" />}
        <button className="grid h-9 w-9 place-items-center rounded-full text-sky-500 hover:bg-sky-500/10" onClick={loadCaptcha} title="Refresh captcha" type="button">
          <Repeat2 size={18} />
        </button>
      </div>
      <AuthField label="Enter the characters above" value={captcha?.text || ""} onChange={(event) => setCaptcha({ id: captcha?.id || 0, image: captcha?.image || "", text: event.currentTarget.value })} required />
    </div>
  );
}
