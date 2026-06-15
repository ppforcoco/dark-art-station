// components/AdsterraNativeBanner.tsx
"use client";

import { useEffect, useRef } from "react";

const CONTAINER_ID = "container-f6d71292a397e72b239944c1e9cb70a6";
const SCRIPT_SRC = `https://pl29749882.effectivecpmnetwork.com/f6d71292a397e72b239944c1e9cb70a6/invoke.js`;

/**
 * Renders an Adsterra "Native Banner" ad unit.
 *
 * This format works by Adsterra's script finding a `<div id="...">` with a
 * specific id and injecting the ad creative into it, so we create that div
 * and load the invoke.js script on mount.
 */
export default function AdsterraNativeBanner({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const host = containerRef.current;
    if (!host) return;
    initialized.current = true;

    // Target div the Adsterra script looks for
    const adDiv = document.createElement("div");
    adDiv.id = CONTAINER_ID;
    host.appendChild(adDiv);

    // Loader script
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = SCRIPT_SRC;
    host.appendChild(script);

    return () => {
      host.innerHTML = "";
      initialized.current = false;
    };
  }, []);

  return <div ref={containerRef} className={`ad-native-banner ${className}`} />;
}