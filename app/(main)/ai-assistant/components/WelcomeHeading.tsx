"use client";
import { useEffect, useState } from "react";
import { useMe } from "@/hooks/useMe";
function getGreeting(hour: number) {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good evening";
}

export function WelcomeHeading() {
  const [greeting, setGreeting] = useState("Hello");
  const { data } = useMe()
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(getGreeting(hour));
  }, []);

  const username = data?.name ?? ""
  return (
    <h1 className="text-2xl font-semibold text-foreground">
      {greeting}, {username}
    </h1>
  );
}