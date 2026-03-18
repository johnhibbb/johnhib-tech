"use client";

import { useState } from "react";

export default function ContactButton() {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSend() {
    const params = new URLSearchParams();
    if (name)    params.set("from", name);
    if (subject) params.set("subject", subject);
    if (message) params.set("body", message);
    const query = params.toString() ? `?${params.toString()}` : "";
    window.location.href = `mailto:hello@johnhib.com${query}`;
    setOpen(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "3px",
    padding: "8px 10px",
    fontFamily: "var(--font-jetbrains, monospace)",
    fontSize: "0.75rem",
    color: "#e8e6e1",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position:      "fixed",
          bottom:        "clamp(1rem, 2vw, 1.5rem)",
          right:         "clamp(1rem, 2vw, 1.5rem)",
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
        aria-label="Get in touch"
      >
        contact
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
              maxWidth:     "480px",
              width:        "100%",
              padding:      "2rem",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
              <span style={{
                fontFamily:    "var(--font-jetbrains, monospace)",
                fontSize:      "0.65rem",
                letterSpacing: "0.1em",
                color:         "var(--muted, #6B6B6B)",
                textTransform: "uppercase",
              }}>
                get in touch
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", color: "var(--muted, #6B6B6B)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={inputStyle}
              />
              <textarea
                placeholder="Message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Send */}
            <button
              onClick={handleSend}
              style={{
                marginTop:     "1.25rem",
                width:         "100%",
                background:    "var(--gold, #C8A96E)",
                border:        "none",
                borderRadius:  "3px",
                padding:       "10px",
                fontFamily:    "var(--font-jetbrains, monospace)",
                fontSize:      "0.7rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color:         "#0a0a0a",
                cursor:        "pointer",
                fontWeight:    600,
              }}
            >
              Open in mail app →
            </button>

            <p style={{
              marginTop:  "0.75rem",
              fontSize:   "0.65rem",
              color:      "var(--muted, #6B6B6B)",
              textAlign:  "center",
              fontFamily: "var(--font-jetbrains, monospace)",
              opacity:    0.6,
            }}>
              Opens your default mail app with fields pre-filled.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
