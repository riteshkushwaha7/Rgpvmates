import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-300",
        secondary: "border border-black/10 bg-white text-ink hover:border-brand-300 focus-visible:ring-brand-200",
        ghost: "text-ink hover:bg-white/70 focus-visible:ring-brand-200",
        danger: "bg-ink text-white hover:bg-black focus-visible:ring-slate-300",
      },
      size: {
        md: "px-5 py-3",
        lg: "px-6 py-4 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);

Button.displayName = "Button";
