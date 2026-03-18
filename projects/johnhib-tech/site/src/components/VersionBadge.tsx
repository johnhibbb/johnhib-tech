"use client";

import { useState } from "react";
import { versions } from "@/data/versions";

export default function VersionBadge() {
  const [open, setOpen] = useState(false);
  const current         = versions[versions.length - 1];

  return (
    <>
      {/* Badge */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position:      "fixed",
          bottom:        "clamp(1rem, 2vw, 1.5rem)",
          left:          "clamp(1rem, 2vw, 1.5rem)",
          zIndex:        10,
          background:    "none",
          border:        "none",
          padding:       0,
          cursor:        "pointer",
          fontFamily:    "var(--font-jetbrains, monospace)",
          fontSize:      "0.65rem",
          color:         "var(--muted, #6B6B6B)",
          letterSpacing: "0.06em",
          opacity:       0.4,
          transition:    "opacity 0.2s ease",
          userSelect:    "none",
          lineHeight:    1,
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.4")}
        aria-label="View version history"
      >
        v{current.version}
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:       "fixed",
            inset:          0,
            zIndex:         100,
            background:     "rgba(8,8,8,0.85)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            padding:        "clamp(1rem, 4vw, 2rem)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:   "#111",
              border:       "1px solid rgba(255,255,255,0.07)",
              borderRadius: "4px",
              maxWidth:     "560px",
              width:        "100%",
              maxHeight:    "80vh",
              overflowY:    "auto",
              padding:      "2rem",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <span style={{
                fontFamily:    "var(--font-jetbrains, monospace)",
                fontSize:      "0.65rem",
                letterSpacing: "0.1em",
                color:         "var(--muted, #6B6B6B)",
                textTransform: "uppercase",
              }}>
                johnhib.tech — version history
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", color: "var(--muted, #6B6B6B)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </div>

            {/* Versions — newest first */}
            {[...versions].reverse().map((v, idx, arr) => (
              <div key={v.version} style={{ marginBottom: idx < arr.length - 1 ? "2.5rem" : 0 }}>

                {/* Version number + date */}
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span style={{
                    fontFamily:    "var(--font-jetbrains, monospace)",
                    fontSize:      "0.9rem",
                    color:         "var(--gold, #C8A96E)",
                    letterSpacing: "0.04em",
                  }}>
                    v{v.version}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-jetbrains, monospace)",
                    fontSize:   "0.65rem",
                    color:      "var(--muted, #6B6B6B)",
                    opacity:    0.6,
                  }}>
                    {v.date}
                  </span>
                </div>

                {/* Title */}
                <p style={{
                  fontFamily: "Georgia, serif",
                  fontStyle:  "italic",
                  fontSize:   "0.95rem",
                  color:      "var(--text, #E8E6E1)",
                  margin:     "0 0 0.75rem",
                  lineHeight: 1.4,
                }}>
                  {v.title}
                </p>

                {/* Notes */}
                <ul style={{ margin: 0, paddingLeft: "1.1rem", listStyle: "none" }}>
                  {v.notes.map((note, i) => (
                    <li key={i} style={{
                      fontFamily: "var(--font-jetbrains, monospace)",
                      fontSize:   "0.72rem",
                      color:      "var(--muted, #6B6B6B)",
                      lineHeight: 1.7,
                      position:   "relative",
                    }}>
                      <span style={{ position: "absolute", left: "-1.1rem", color: "var(--gold, #C8A96E)", opacity: 0.5 }}>—</span>
                      {note}
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                {idx < arr.length - 1 && (
                  <div style={{ marginTop: "2rem", height: "1px", background: "rgba(255,255,255,0.05)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
