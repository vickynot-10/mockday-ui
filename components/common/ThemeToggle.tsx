"use client";

import { motion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <>
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative hidden sm:block h-8 w-16 rounded-full border border-border bg-secondary p-1"
        aria-label="Toggle theme"
      >
        <motion.div
          className="flex size-6 items-center justify-center rounded-full bg-background"
          animate={{ x: isDark ? 32 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {isDark ? (
            <Moon className="size-3.5" />
          ) : (
            <Sun className="size-3.5" />
          )}
        </motion.div>
      </button>

      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative flex justify-center size-9 sm:hidden  rounded-full border border-border bg-secondary p-1 items-center "
        aria-label="Toggle theme"
      >
        {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
      </button>
    </>
  );
}
