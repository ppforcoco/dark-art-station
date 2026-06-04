"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  prevHref: string | null;
  nextHref: string | null;
  showHint?: boolean;
  prevImage?: { href: string; title: string; thumb: string } | null;
  nextImage?: { href: string; title: string; thumb: string } | null;
}

export default function KeyboardNav({ prevHref, nextHref }: Props) {
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.key === "ArrowLeft" || e.key === "ArrowUp") && prevHref) router.push(prevHref);
      if ((e.key === "ArrowRight" || e.key === "ArrowDown") && nextHref) router.push(nextHref);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prevHref, nextHref, router]);

  return null;
}