"use client";
import { useFormContext } from "react-hook-form";
import { FormValues } from "@/types/autofill.types";

export default function AboutYouTab() {
  const { register } = useFormContext<FormValues>();

  return (
    <>
      <h2 className="text-lg font-semibold mb-1">About You</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Used by the AI to answer open-ended questions like "Why do you want this role?" that don't match a fixed rule. Mention your career goals, strengths, and the kind of roles you're targeting — the more context you give, the closer the AI matches your tone.
      </p>

      <textarea
        {...register("about_you")}
        rows={8}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
        placeholder="e.g. I'm a full-stack engineer who enjoys building developer tools. Looking for product-focused teams where I can own features end-to-end..."
      />
    </>
  );
}