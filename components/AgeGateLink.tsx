// components/AgeGateLink.tsx
"use client";

import { useState } from "react";

interface Props {
  slug: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function AgeGateLink({ slug, children, className, style }: Props) {
  const [show, setShow] = useState(false);

  return (
    <>
      {/* Age-gate modal */}
      {show && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(5,5,10,0.93)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShow(false)}
        >
          <div
            style={{
              background: "#0c0812",
              border: "1px solid #c0001a",
              maxWidth: "420px", width: "100%",
              padding: "40px 32px",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 18+ circle */}
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "72px", height: "72px",
              border: "3px solid #c0001a",
              borderRadius: "50%",
              marginBottom: "22px",
            }}>
              <span style={{
                fontFamily: "monospace",
                fontWeight: 900, fontSize: "1.4rem",
                color: "#c0001a",
              }}>16+</span>
            </div>

            <p style={{
              fontFamily: "monospace",
              fontSize: "0.6rem", letterSpacing: "0.25em",
              textTransform: "uppercase", color: "#c0001a",
              marginBottom: "10px",
            }}>
              Mature Content Warning
            </p>

            <h2 style={{
              fontFamily: "monospace",
              fontSize: "1rem", fontWeight: 700,
              color: "#f0ecff", marginBottom: "14px",
              letterSpacing: "0.02em",
            }}>
              This collection is for<br />16+ audiences only
            </h2>

            <p style={{
              fontFamily: "monospace",
              fontSize: "0.62rem", letterSpacing: "0.05em",
              color: "#8a8099", lineHeight: 1.8,
              marginBottom: "30px",
            }}>
              This collection contains graphic skull, skeleton, and dark humour imagery.
              By continuing you confirm you are 18 years of age or older.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShow(false)}
                style={{
                  flex: 1, padding: "13px 8px",
                  background: "transparent",
                  border: "1px solid #2a2535",
                  color: "#6b6480",
                  fontFamily: "monospace",
                  fontSize: "0.58rem", letterSpacing: "0.15em",
                  textTransform: "uppercase", cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4a445a")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2535")}
              >
                ← Go Back
              </button>
              <a
                href={`/shop/${slug}`}
                style={{
                  flex: 1.6, padding: "13px 8px",
                  background: "#c0001a",
                  border: "1px solid #c0001a",
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: "0.58rem", letterSpacing: "0.15em",
                  textTransform: "uppercase", cursor: "pointer",
                  textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#a80000")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#c0001a")}
              >
                I am 16+ — Continue →
              </a>
            </div>

            <p style={{
              fontFamily: "monospace",
              fontSize: "0.5rem", letterSpacing: "0.08em",
              color: "#3a3550", marginTop: "18px",
            }}>
              Click anywhere outside to dismiss
            </p>
          </div>
        </div>
      )}

      {/* The card itself — intercept click */}
      <div
        className={className}
        style={{ cursor: "pointer", ...style }}
        onClick={() => setShow(true)}
      >
        {children}
      </div>
    </>
  );
}