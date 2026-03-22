import { z } from "zod";

const safeText = (minLength: number, maxLength: number) =>
  z
    .string()
    .trim()
    .min(minLength)
    .max(maxLength)
    .transform((value) => value.replace(/[<>]/g, ""));

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  age: z.number().int().min(18).max(99),
  isAdultConfirmed: z.literal(true),
  gender: z.enum(["man", "woman", "non-binary", "prefer-not-to-say"]),
  city: z.string().trim().min(2).max(80),
  bio: safeText(0, 280),
  interests: z.array(z.string().trim().min(2).max(32)).min(2).max(6),
});

export const messageSchema = z.object({
  matchId: z.string().uuid(),
  content: safeText(1, 1000),
});

export const reportSchema = z.object({
  reportedUserId: z.string().uuid(),
  category: z.string().trim().min(3).max(60),
  details: safeText(0, 500).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  subject: z.string().trim().min(4).max(120),
  message: safeText(10, 1000),
});

export const paymentIntentSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
  acceptNoRefunds: z.literal(true),
});
