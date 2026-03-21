"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrMsg("Enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrMsg(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setErrMsg("Network error. Please try again.");
    }
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
        placeholder="your.email@domain.com"
        className="nl-input"
        disabled={status === "loading" || status === "success"}
        aria-label="Email address"
        autoComplete="email"
        inputMode="email"
      />
      <button
        type="submit"
        className="nl-btn"
        disabled={status === "loading" || status === "success"}
      >
        {status === "loading" ? "Sending…"
          : status === "success" ? "Subscribed ✓"
          : "Subscribe"}
      </button>

      {status === "error" && (
        <p className="nl-feedback error" role="alert">{errMsg}</p>
      )}
      {status === "success" && (
        <p className="nl-feedback success" role="status">
          You&apos;re in. Check your inbox for a welcome from the void.
        </p>
      )}
    </form>
  );
}