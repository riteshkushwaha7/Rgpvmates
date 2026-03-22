import type { Gender } from "@/types/app";

export const genderOptions: { label: string; value: Gender }[] = [
  { label: "Man", value: "man" },
  { label: "Woman", value: "woman" },
  { label: "Non-binary", value: "non-binary" },
  { label: "Prefer not to say", value: "prefer-not-to-say" },
];

export const cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Kolkata", "Chennai", "Ahmedabad"];

export const interestOptions = [
  "Travel",
  "Coffee",
  "Long walks",
  "Fitness",
  "Cinema",
  "Books",
  "Music",
  "Food spots",
  "Road trips",
  "Art",
  "Gaming",
  "Photography",
];

export const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/safety", label: "Safety Guidelines" },
  { href: "/contact", label: "Contact Us" },
];

export const legalBullets = [
  "Google sign-in only with no custom password storage.",
  "Supabase powers auth, database, storage, and realtime capabilities.",
  "Razorpay handles payment processing and payment verification.",
  "Flirmo may suspend or terminate accounts that violate safety or legal rules.",
];
