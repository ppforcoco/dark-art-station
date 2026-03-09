'use client';

import { useState } from "react";

type FormState = "idle" | "sending" | "success" | "error";

const SUBJECTS = [
  "Technical Support",
  "Licensing / Commercial Use",
  "Custom Commission",
  "Press / Collaboration",
  "Privacy / Data Request",
  "Other",
];

export default function ContactForm() {
  const [state,   setState]   = useState<FormState>("idle");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error("Server error");
      setState("success");
      setName(""); setEmail(""); setMessage("");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="contact-success">
        <p className="contact-success-glyph">✦</p>
        <p className="contact-success-msg">
          Your message has been received. We will respond within 1–3 business days.
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>

      <div className="contact-form-row">
        <div className="contact-field">
          <label className="contact-label" htmlFor="cf-name">Name</label>
          <input
            id="cf-name"
            className="contact-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            minLength={2}
            placeholder="Your name"
          />
        </div>
        <div className="contact-field">
          <label className="contact-label" htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            className="contact-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="contact-field">
        <label className="contact-label" htmlFor="cf-subject">Subject</label>
        <select
          id="cf-subject"
          className="contact-input contact-select"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        >
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="contact-field">
        <label className="contact-label" htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          className="contact-input contact-textarea"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          minLength={10}
          placeholder="Describe your enquiry in as much detail as possible…"
          rows={6}
        />
      </div>

      {state === "error" && (
        <p className="contact-error">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <button
        type="submit"
        className="btn-primary contact-submit"
        disabled={state === "sending"}
      >
        <span>{state === "sending" ? "Sending…" : "Send Message"}</span>
      </button>

    </form>
  );
}