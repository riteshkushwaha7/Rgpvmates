import { cn } from "@/lib/utils";

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition",
        active ? "border-brand-600 bg-brand-600 text-white" : "border-black/10 bg-white text-slate-700 hover:border-brand-300",
      )}
    >
      {children}
    </button>
  );
}
