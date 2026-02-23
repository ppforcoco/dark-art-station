"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) { setStatus("error"); return; }
    // TODO: wire to email service
    setStatus("success");
    setEmail("");
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your.soul@email.com"
        className="nl-input"
      />
      <button type="submit" className="nl-btn">
        {status === "success" ? "Summoned ✦" : "Summon"}
      </button>
      {status === "error" && (
        <p className="nl-feedback error">Enter a valid soul address.</p>
      )}
      {status === "success" && (
        <p className="nl-feedback success">Welcome to the congregation.</p>
      )}
    </form>
  );
}