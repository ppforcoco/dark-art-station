"use client";

import { useState, useEffect } from "react";

type Step = "closed" | "open" | "sending" | "done" | "error";

export default function FeedbackWidget() {
  const [step, setStep] = useState<Step>("closed");
  const [page, setPage] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (step === "open") setPage(window.location.pathname);
  }, [step]);

  useEffect(() => {
    const handler = () => setStep("open");
    window.addEventListener("open-feedback", handler);
    return () => window.removeEventListener("open-feedback", handler);
  }, []);

  async function handleSubmit(e: React.MouseEvent) {
    e.stopPropagation();
    if (!category || !message.trim()) return;
    setStep("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, category, message: message.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setStep("done");
      setTimeout(() => {
        setStep("closed");
        setCategory("");
        setMessage("");
        setEmail("");
      }, 3000);
    } catch {
      setStep("error");
    }
  }

  function handleClose() {
    setStep("closed");
    setCategory("");
    setMessage("");
    setEmail("");
  }

  if (step === "closed") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: "20px",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "#0f0d1a",
          border: "1px solid #2a2535",
          borderTop: "2px solid #c0001a",
          width: "100%",
          maxWidth: "400px",
          padding: "24px",
          fontFamily: "monospace",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <p style={{ color: "#c0001a", fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
              Haunted Wallpapers
            </p>
            <h3 style={{ color: "#f0ecff", fontSize: "0.9rem", margin: "4px 0 0", letterSpacing: "0.05em" }}>
              Report a Problem
            </h3>
          </div>
          <button
            onClick={e => { e.stopPropagation(); handleClose(); }}
            style={{ background: "transparent", border: "none", color: "#6b6480", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, padding: "0 0 0 12px" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>✓</div>
            <p style={{ color: "#c0001a", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
              Report received — thank you!
            </p>
            <p style={{ color: "#6b6480", fontSize: "0.65rem", marginTop: "8px" }}>
              We&apos;ll look into it.
            </p>
          </div>
        )}

        {step === "error" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ color: "#c0001a", fontSize: "0.7rem", margin: "0 0 12px" }}>Something went wrong. Please try again.</p>
            <button onClick={e => { e.stopPropagation(); setStep("open"); }} style={btnStyle}>Try Again</button>
          </div>
        )}

        {(step === "open" || step === "sending") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Page</label>
              <div style={{ ...inputStyle, color: "#6b6480", background: "#0a0814", fontSize: "0.65rem" }}>
                {page}
              </div>
            </div>

            <div>
              <label style={labelStyle}>What&apos;s the issue? <span style={{ color: "#c0001a" }}>*</span></label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                onClick={e => e.stopPropagation()}
                style={{ ...inputStyle, appearance: "none" as const, cursor: "pointer" }}
                disabled={step === "sending"}
              >
                <option value="">Select a category…</option>
                <option value="broken-link">Broken link / 404</option>
                <option value="image-not-loading">Image not loading</option>
                <option value="download-broken">Download not working</option>
                <option value="layout-broken">Layout / display issue</option>
                <option value="slow-page">Page very slow</option>
                <option value="search-broken">Search not working</option>
                <option value="error-message">Error message shown</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Describe the problem <span style={{ color: "#c0001a" }}>*</span></label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="What happened? What did you expect to happen?"
                rows={3}
                style={{ ...inputStyle, resize: "vertical" as const, minHeight: "72px" }}
                disabled={step === "sending"}
              />
            </div>

            <div>
              <label style={labelStyle}>Your email <span style={{ color: "#6b6480" }}>(optional — only if you want a reply)</span></label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="you@example.com"
                style={inputStyle}
                disabled={step === "sending"}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!category || !message.trim() || step === "sending"}
              style={{
                ...btnStyle,
                opacity: (!category || !message.trim() || step === "sending") ? 0.5 : 1,
                cursor: (!category || !message.trim() || step === "sending") ? "not-allowed" : "pointer",
              }}
            >
              {step === "sending" ? "Sending…" : "Send Report"}
            </button>

            <p style={{ color: "#3a3545", fontSize: "0.58rem", textAlign: "center", margin: 0, letterSpacing: "0.05em" }}>
              Reports go directly to our admin panel. We read every one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#8a8099",
  fontSize: "0.58rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#1a1625",
  border: "1px solid #2a2535",
  color: "#f0ecff",
  padding: "9px 11px",
  fontSize: "0.78rem",
  fontFamily: "monospace",
  outline: "none",
  boxSizing: "border-box",
};

const btnStyle: React.CSSProperties = {
  background: "#c0001a",
  border: "none",
  color: "#fff",
  padding: "11px 20px",
  fontSize: "0.65rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  fontFamily: "monospace",
  cursor: "pointer",
  width: "100%",
  transition: "background 0.2s",
};