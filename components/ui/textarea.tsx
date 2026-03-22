import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full rounded-[1.75rem] border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 placeholder:text-slate-400",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
