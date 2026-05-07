"use client";

import { useEffect, useState, useRef } from "react";

interface Comment {
  id: string;
  name: string;
  message: string;
  likes: number;
  createdAt: string;
  status: string;
}

interface Props {
  imageId: string;
  imageTitle: string;
}

const BANNED_WORDS = [
  "porn","sex","nude","naked","xxx","fuck","shit","ass","bitch","cock","dick",
  "pussy","cunt","whore","slut","nigger","nigga","faggot","rape","kill yourself",
];

function containsBannedWords(text: string): boolean {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((w) => lower.includes(w));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function BirthdayComments({ imageId, imageTitle }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
    const saved = localStorage.getItem("hw-liked-comments");
    if (saved) setLikedIds(new Set(JSON.parse(saved)));
  }, [imageId]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/comments/${imageId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {}
    setLoading(false);
  }

  async function handleSubmit() {
    setError("");
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setError("Please write a longer comment (at least 5 characters).");
      return;
    }
    if (message.trim().length > 300) {
      setError("Keep it under 300 characters.");
      return;
    }
    if (containsBannedWords(name) || containsBannedWords(message)) {
      setError("Your message contains inappropriate content.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/comments/${imageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
      } else {
        setSuccess(true);
        setName("");
        setMessage("");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  async function handleLike(commentId: string) {
    if (likedIds.has(commentId)) return;
    const newLiked = new Set(likedIds);
    newLiked.add(commentId);
    setLikedIds(newLiked);
    localStorage.setItem("hw-liked-comments", JSON.stringify([...newLiked]));
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
    try {
      await fetch(`/api/comments/like/${commentId}`, { method: "POST" });
    } catch {}
  }

  const topComment = comments[0];
  const rest = comments.slice(1);

  return (
    <section style={{
      margin: "3rem 0",
      padding: "0 1rem",
      fontFamily: "var(--font-cormorant, Georgia, serif)",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "0.5rem",
        }}>
          <span style={{ color: "#8b7355", fontSize: "1.2rem" }}>✦</span>
          <h2 style={{
            fontFamily: "var(--font-cinzel, serif)",
            fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
            fontWeight: 700,
            color: "#e8d5b7",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            margin: 0,
          }}>
            Comments
          </h2>
          <span style={{ color: "#8b7355", fontSize: "1.2rem" }}>✦</span>
        </div>
        <p style={{
          color: "#7a6a5a",
          fontSize: "0.9rem",
          fontStyle: "italic",
          margin: 0,
          letterSpacing: "0.05em",
        }}>
          What do you think of {imageTitle} — approved comments appear below
        </p>
        <div style={{
          width: "120px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, #8b7355, transparent)",
          margin: "1rem auto 0",
        }} />
      </div>

      {/* Top comment crown */}
      {!loading && topComment && (
        <div style={{
          background: "linear-gradient(135deg, rgba(139,115,85,0.12), rgba(232,213,183,0.06))",
          border: "1px solid rgba(139,115,85,0.35)",
          borderRadius: "2px",
          padding: "1.25rem 1.5rem",
          marginBottom: "1rem",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            top: "-11px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0c0b14",
            padding: "0 0.75rem",
            color: "#c9a84c",
            fontSize: "0.75rem",
            fontFamily: "var(--font-cinzel, serif)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            👑 Top Comment
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <p style={{
                color: "#e8d5b7",
                fontSize: "1rem",
                lineHeight: 1.65,
                margin: "0 0 0.6rem",
                fontStyle: "italic",
              }}>
                &ldquo;{topComment.message}&rdquo;
              </p>
              <span style={{
                color: "#8b7355",
                fontSize: "0.8rem",
                fontFamily: "var(--font-space, monospace)",
                letterSpacing: "0.05em",
              }}>
                — {topComment.name} · {timeAgo(topComment.createdAt)}
              </span>
            </div>
            <button
              onClick={() => handleLike(topComment.id)}
              style={{
                background: likedIds.has(topComment.id) ? "rgba(139,115,85,0.2)" : "transparent",
                border: `1px solid ${likedIds.has(topComment.id) ? "#8b7355" : "rgba(139,115,85,0.3)"}`,
                borderRadius: "2px",
                color: likedIds.has(topComment.id) ? "#c9a84c" : "#7a6a5a",
                cursor: likedIds.has(topComment.id) ? "default" : "pointer",
                padding: "0.35rem 0.6rem",
                fontSize: "0.8rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                minWidth: "44px",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              <span>♥</span>
              <span style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.7rem" }}>
                {topComment.likes}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Rest of comments */}
      {!loading && rest.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
          {rest.map((comment) => (
            <div key={comment.id} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(139,115,85,0.15)",
              borderRadius: "2px",
              padding: "1rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
            }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  color: "#c8b89a",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  margin: "0 0 0.5rem",
                  fontStyle: "italic",
                }}>
                  &ldquo;{comment.message}&rdquo;
                </p>
                <span style={{
                  color: "#6a5a4a",
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-space, monospace)",
                }}>
                  — {comment.name} · {timeAgo(comment.createdAt)}
                </span>
              </div>
              <button
                onClick={() => handleLike(comment.id)}
                style={{
                  background: "transparent",
                  border: `1px solid ${likedIds.has(comment.id) ? "#8b7355" : "rgba(139,115,85,0.2)"}`,
                  borderRadius: "2px",
                  color: likedIds.has(comment.id) ? "#c9a84c" : "#5a4a3a",
                  cursor: likedIds.has(comment.id) ? "default" : "pointer",
                  padding: "0.3rem 0.5rem",
                  fontSize: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                  minWidth: "40px",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <span>♥</span>
                <span style={{ fontFamily: "var(--font-space, monospace)", fontSize: "0.65rem" }}>
                  {comment.likes}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p style={{
          textAlign: "center",
          color: "#5a4a3a",
          fontStyle: "italic",
          fontSize: "0.9rem",
          padding: "1.5rem 0",
        }}>
          No comments yet. Be the first ✦ ✦
        </p>
      )}

      {loading && (
        <p style={{ textAlign: "center", color: "#5a4a3a", fontSize: "0.85rem", padding: "1rem 0" }}>
          Loading comments...
        </p>
      )}

      {/* Divider */}
      <div style={{
        width: "80px",
        height: "1px",
        background: "linear-gradient(90deg, transparent, #8b7355, transparent)",
        margin: "1.5rem auto",
      }} />

      {/* Submit form */}
      <div ref={formRef} style={{ maxWidth: "480px", margin: "0 auto" }}>
        {success ? (
          <div style={{
            textAlign: "center",
            padding: "1.5rem",
            background: "rgba(139,115,85,0.08)",
            border: "1px solid rgba(139,115,85,0.25)",
            borderRadius: "2px",
          }}>
            <p style={{ color: "#c9a84c", fontSize: "1rem", margin: "0 0 0.4rem", fontFamily: "var(--font-cinzel, serif)" }}>
              ✦ Comment Received ✦
            </p>
            <p style={{ color: "#7a6a5a", fontSize: "0.85rem", margin: 0, fontStyle: "italic" }}>
              Your comment is awaiting approval and will appear soon.
            </p>
            <button
              onClick={() => setSuccess(false)}
              style={{
                marginTop: "1rem",
                background: "transparent",
                border: "1px solid rgba(139,115,85,0.3)",
                color: "#8b7355",
                padding: "0.4rem 1rem",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontFamily: "var(--font-cinzel, serif)",
                letterSpacing: "0.1em",
                borderRadius: "2px",
              }}
            >
              Leave Another
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{
              textAlign: "center",
              color: "#8b7355",
              fontSize: "0.8rem",
              fontFamily: "var(--font-cinzel, serif)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: "0 0 0.25rem",
            }}>
              Leave a Comment
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(139,115,85,0.25)",
                borderRadius: "2px",
                color: "#e8d5b7",
                padding: "0.65rem 0.9rem",
                fontSize: "0.9rem",
                fontFamily: "var(--font-cormorant, serif)",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            <textarea
              placeholder="What do you think of this wallpaper..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={300}
              rows={3}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(139,115,85,0.25)",
                borderRadius: "2px",
                color: "#e8d5b7",
                padding: "0.65rem 0.9rem",
                fontSize: "0.9rem",
                fontFamily: "var(--font-cormorant, serif)",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#4a3a2a", fontSize: "0.75rem", fontFamily: "var(--font-space, monospace)" }}>
                {message.length}/300
              </span>
              <span style={{ color: "#4a3a2a", fontSize: "0.72rem", fontStyle: "italic" }}>
                Max 3 comments per day
              </span>
            </div>
            {error && (
              <p style={{
                color: "#c0453a",
                fontSize: "0.82rem",
                margin: 0,
                fontStyle: "italic",
                borderLeft: "2px solid #c0453a",
                paddingLeft: "0.75rem",
              }}>
                {error}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                background: submitting ? "rgba(139,115,85,0.1)" : "rgba(139,115,85,0.15)",
                border: "1px solid rgba(139,115,85,0.4)",
                borderRadius: "2px",
                color: submitting ? "#5a4a3a" : "#c9a84c",
                padding: "0.7rem",
                fontSize: "0.82rem",
                fontFamily: "var(--font-cinzel, serif)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                width: "100%",
              }}
            >
              {submitting ? "Sending..." : "✦ Post Comment ✦"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}