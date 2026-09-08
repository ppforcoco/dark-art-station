"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "hw-theme";
const LIGHT_BG = "#fff3e0";
const LIGHT_TEXT = "#35205c";
const DARK_BG = "#190c30";
const DARK_TEXT = "#fdf0ff";

/**
 * Site-wide light/dark toggle. Writes the same "hw-theme" localStorage
 * key that the inline script in app/layout.tsx already reads before
 * first paint, so there's no flash-of-wrong-theme on reload.
 *
 * "fog" = the cartoon daylight theme (see app/theme-cartoon-fog.css).
 * No attribute = the default Ruby Haunted dark theme.
 */
export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.getAttribute("data-theme") === "fog");
  }, []);

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);

    if (next) {
      document.documentElement.setAttribute("data-theme", "fog");
      document.documentElement.style.backgroundColor = LIGHT_BG;
      document.documentElement.style.color = LIGHT_TEXT;
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.style.backgroundColor = DARK_BG;
      document.documentElement.style.color = DARK_TEXT;
    }

    try {
      if (next) localStorage.setItem(STORAGE_KEY, "fog");
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* localStorage unavailable — theme just won't persist across reloads */
    }
  };

  return (
    <button
      type="button"
      className="hw-nav__icon-btn hw-theme-toggle"
      onClick={toggle}
      aria-label={isLight ? "Switch to haunted dark theme" : "Switch to daylight cartoon theme"}
      aria-pressed={isLight}
      title={isLight ? "Back to the haunted side" : "Step into the daylight"}
    >
      {isLight ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}