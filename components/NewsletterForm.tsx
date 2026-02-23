"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    // TODO: wire up to your email service here
    setStatus("success");
    setEmail("");
  };

  return (
    <form className="flex max-w-[480px] mx-auto relative" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your.soul@email.com"
        className="flex-1 bg-ash border border-smoke border-r-0 text-[#f0ecff] font-mono text-[0.8rem] px-5 py-4 outline-none focus:border-blood placeholder:text-smoke transition-colors"
      />
      <button
        type="submit"
        className="bg-blood border border-blood text-[#f0ecff] font-mono text-[0.7rem] tracking-[0.15em] uppercase px-7 py-4 hover:bg-ember hover:border-ember transition-all"
      >
        {status === "success" ? "Summoned ✦" : "Summon"}
      </button>

      {status === "error" && (
        <p className="absolute -bottom-7 left-0 font-mono text-[0.6rem] tracking-widest uppercase text-ember">
          Enter a valid soul address.
        </p>
      )}
      {status === "success" && (
        <p className="absolute -bottom-7 left-0 font-mono text-[0.6rem] tracking-widest uppercase text-gold">
          Welcome to the congregation.
        </p>
      )}
    </form>
  );
}