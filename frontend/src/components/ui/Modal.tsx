import { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section
        className="max-h-[82vh] w-full max-w-xl overflow-auto rounded-2xl border border-zinc-200 bg-white text-zinc-950 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
        style={{ animation: "bugModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-5 py-3.5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
          <h3 className="text-lg font-bold capitalize">{title}</h3>
          <button className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
