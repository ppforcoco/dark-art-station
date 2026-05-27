"use client";
// components/PWARegister.tsx
// Registers /sw.js as a Service Worker.
//
// IMPORTANT: /sw.js must exist at public/sw.js — see that file for the full
// fetch routing logic, especially the analytics passthrough rules that prevent
// the SW from intercepting analytics beacon requests.

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Delay registration until after page load so it doesn't compete with
    // critical resources on first paint.
    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Check for updates on every page load
          reg.update().catch(() => {});
          console.log("[HW] SW registered:", reg.scope);
        })
        .catch((err) => {
          // SW failed to register — site still works, just without offline support
          console.warn("[HW] SW registration failed:", err);
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}