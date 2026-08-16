"use client";
import { useEffect } from "react";
import { initOneSignal } from "@/lib/onesignal";

export default function OneSignalInit() {
  useEffect(() => {
    initOneSignal(process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!);
  }, []);

  return null;
}
