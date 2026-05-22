export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
      <p className="text-base text-zinc-400 dark:text-zinc-500">{text}</p>
    </div>
  );
}
