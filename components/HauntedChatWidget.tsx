"use client";

import { useState, useRef, useEffect } from "react";

type Role = "user" | "assistant";
interface Msg {
  role: Role;
  content: string;
}

const GREETING: Msg = {
  role: "assistant",
  content:
    "I am the Keeper of this town's archive. I assist with wallpapers, downloads, favorites, and submissions for Haunted Wallpapers. How can I help?",
};

const NETWORK_ERROR =
  "Couldn't reach The Keeper — check your network connection and try again.";

// Preset questions shown to the visitor so they can tap instead of typing.
// Keep this list strictly about site/wallpaper functionality.
const PRESET_QUESTIONS: string[] = [
  "How do I download a wallpaper?",
  "How do favorites work?",
  "How do I submit my own artwork?",
  "Where do I find iPhone wallpapers?",
  "How do I report a problem?",
  "What does the Keeper do here?",
];

export default function HauntedChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(text: string) {
    if (!text || sending) return;

    // If the browser already knows it's offline, don't even try the request.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setError(NETWORK_ERROR);
      return;
    }

    const nextMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter((m) => m !== GREETING)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      let data: { reply?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // Response wasn't JSON (e.g. a proxy/host error page) — treat as network trouble.
        setError(NETWORK_ERROR);
        return;
      }

      if (!res.ok) {
        setError(data?.error || NETWORK_ERROR);
        return;
      }

      if (!data.reply) {
        setError(NETWORK_ERROR);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply as string }]);
    } catch {
      // fetch() throws on actual connectivity failures (DNS, offline, CORS, timeout)
      setError(NETWORK_ERROR);
    } finally {
      setSending(false);
    }
  }

  function handleSend() {
    sendMessage(input.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Only show preset questions before the visitor has sent their own message.
  const showPresets = messages.length === 1 && !sending;

  return (
    <>
      {/* Launcher pill — bottom LEFT so it never collides with the ambient player (bottom right) */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat with The Keeper"}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          height: "48px",
          padding: open ? "0" : "0 18px 0 14px",
          width: open ? "48px" : "auto",
          borderRadius: "999px",
          background: "#c0001a",
          border: "1px solid #ff4d5e",
          color: "#fff",
          fontFamily: "monospace",
          fontSize: "0.78rem",
          letterSpacing: "0.05em",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(192,0,26,0.5)",
          justifyContent: "center",
          transition: "width 0.15s ease, padding 0.15s ease",
        }}
      >
        <span style={{ fontSize: "1.15rem", lineHeight: 1 }}>{open ? "✕" : "💬"}</span>
        {!open && <span>Chat with The Keeper</span>}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "84px",
            left: "20px",
            zIndex: 9998,
            width: "min(360px, calc(100vw - 40px))",
            height: "min(520px, calc(100vh - 140px))",
            background: "#0f0d1a",
            border: "1px solid #2a2535",
            borderTop: "2px solid #c0001a",
            display: "flex",
            flexDirection: "column",
            fontFamily: "monospace",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid #2a2535",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "#1a1625",
                border: "1px solid #2a2535",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem",
                flexShrink: 0,
              }}
              aria-hidden
            >
              💬
            </span>
            <div>
              <p
                style={{
                  color: "#c0001a",
                  fontSize: "0.55rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Haunted Wallpapers · Live Chat
              </p>
              <h3
                style={{
                  color: "#f0ecff",
                  fontSize: "0.9rem",
                  margin: "4px 0 0",
                  letterSpacing: "0.05em",
                }}
              >
                The Keeper — Site Assistant
              </h3>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: m.role === "user" ? "#c0001a" : "#1a1625",
                  border: m.role === "user" ? "none" : "1px solid #2a2535",
                  color: m.role === "user" ? "#fff" : "#e0e0e0",
                  padding: "9px 12px",
                  fontSize: "0.78rem",
                  lineHeight: 1.5,
                  borderRadius: "4px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {m.content}
              </div>
            ))}

            {/* Preset question chips — tap instead of typing */}
            {showPresets && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  marginTop: "2px",
                }}
              >
                <span
                  style={{
                    color: "#6b6480",
                    fontSize: "0.62rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                  }}
                >
                  Common questions
                </span>
                {PRESET_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      textAlign: "left",
                      background: "#1a1625",
                      border: "1px solid #2a2535",
                      color: "#c9c4dd",
                      padding: "8px 10px",
                      fontSize: "0.72rem",
                      fontFamily: "monospace",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {sending && (
              <div
                style={{
                  alignSelf: "flex-start",
                  color: "#6b6480",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                }}
              >
                The Keeper is responding…
              </div>
            )}
            {error && (
              <div
                style={{
                  alignSelf: "center",
                  color: "#c0001a",
                  fontSize: "0.68rem",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              borderTop: "1px solid #2a2535",
              padding: "12px",
              display: "flex",
              gap: "8px",
              alignItems: "flex-end",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about wallpapers, downloads, submissions…"
              rows={1}
              disabled={sending}
              style={{
                flex: 1,
                resize: "none",
                background: "#1a1625",
                border: "1px solid #2a2535",
                color: "#f0ecff",
                padding: "9px 11px",
                fontSize: "0.78rem",
                fontFamily: "monospace",
                outline: "none",
                maxHeight: "80px",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                background: "#c0001a",
                border: "none",
                color: "#fff",
                padding: "9px 14px",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "monospace",
                cursor: !input.trim() || sending ? "not-allowed" : "pointer",
                opacity: !input.trim() || sending ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}