"use client";
// components/PWARegister.tsx
// Drop <PWARegister /> inside your root layout.tsx (inside <body>, after ClientComponents)

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("[HW] SW registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[HW] SW registration failed:", err);
        });
    }
  }, []);

  return null;
}