"use client";
// app/offline/page.tsx

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Courier New', monospace",
        color: "#c0001a",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: "1.5rem", opacity: 0.85 }}
      >
        <circle cx="40" cy="34" r="26" fill="#1a0005" stroke="#c0001a" strokeWidth="1.5" />
        <ellipse cx="31" cy="32" rx="6" ry="7" fill="#0a0a0a" />
        <ellipse cx="49" cy="32" rx="6" ry="7" fill="#0a0a0a" />
        <rect x="27" y="56" width="26" height="10" rx="3" fill="#1a0005" stroke="#c0001a" strokeWidth="1.5" />
        <line x1="34" y1="56" x2="34" y2="66" stroke="#c0001a" strokeWidth="1" />
        <line x1="40" y1="56" x2="40" y2="66" stroke="#c0001a" strokeWidth="1" />
        <line x1="46" y1="56" x2="46" y2="66" stroke="#c0001a" strokeWidth="1" />
        <line x1="40" y1="42" x2="40" y2="56" stroke="#c0001a" strokeWidth="1" strokeDasharray="2 2" />
      </svg>

      <h1
        style={{
          fontSize: "clamp(1.4rem, 5vw, 2rem)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
          color: "#c0001a",
        }}
      >
        You&apos;re in the dark.
      </h1>
      <p
        style={{
          color: "#6b0010",
          fontSize: "0.95rem",
          letterSpacing: "0.08em",
          maxWidth: "320px",
          lineHeight: 1.7,
          marginBottom: "2rem",
        }}
      >
        No internet connection. The spirits can&apos;t reach you right now.
        <br />
        Check your connection and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          background: "transparent",
          border: "1px solid #c0001a",
          color: "#c0001a",
          padding: "0.65rem 1.8rem",
          fontFamily: "'Courier New', monospace",
          fontSize: "0.85rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#c0001a";
          (e.currentTarget as HTMLButtonElement).style.color = "#0a0a0a";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#c0001a";
        }}
      >
        Try Again
      </button>
    </div>
  );
}