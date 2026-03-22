import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function initials(name?: string | null) {
  return (name || "Flirmo User")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

export function clampText(value: string, maxLength: number) {
  return sanitizeText(value).slice(0, maxLength);
}
