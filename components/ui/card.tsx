import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft backdrop-blur", className)}>
      {children}
    </div>
  );
}
