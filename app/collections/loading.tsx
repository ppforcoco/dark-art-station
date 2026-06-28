// Skeleton loading screen — shown while page data fetches
export default function Loading() {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        minHeight: "100vh",
        color: "var(--text-primary)",
      }}
    >
      {/* Breadcrumb skeleton */}
      <div style={{ height: "40px", borderBottom: "1px solid #2a2535" }} />

      {/* Header skeleton */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 24px" }}>
        <div className="skel skel-sm" style={{ width: "140px", marginBottom: "12px" }} />
        <div className="skel skel-lg" style={{ width: "260px", marginBottom: "8px" }} />
        <div className="skel skel-sm" style={{ width: "180px" }} />
      </div>

      {/* Grid skeleton */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 60px" }}>
        <div className="skel-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skel-card">
              <div className="skel skel-img" />
              <div style={{ padding: "16px" }}>
                <div className="skel skel-sm" style={{ width: "60%", marginBottom: "8px" }} />
                <div className="skel skel-md" style={{ width: "90%", marginBottom: "6px" }} />
                <div className="skel skel-md" style={{ width: "75%", marginBottom: "16px" }} />
                <div className="skel skel-btn" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes skel-pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
        .skel {
          background: #2a2535;
          border-radius: 3px;
          animation: skel-pulse 1.6s ease-in-out infinite;
        }
        .skel-sm  { height: 12px; }
        .skel-md  { height: 16px; }
        .skel-lg  { height: 28px; }
        .skel-img {
          background: #2a2535;
          width: 100%;
          aspect-ratio: 9/16;
          animation: skel-pulse 1.6s ease-in-out infinite;
        }
        .skel-btn {
          background: #2a2535;
          height: 44px;
          width: 100%;
          animation: skel-pulse 1.6s ease-in-out infinite;
        }
        .skel-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .skel-card { background: #1a1727; }
        @media (max-width: 1023px) { .skel-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 639px)  { .skel-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
      `}</style>
    </div>
  );
}