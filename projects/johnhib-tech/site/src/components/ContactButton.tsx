"use client";

import { useState } from "react";

export default function ContactButton() {
  const [open,     setOpen]     = useState(false);
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [subject,  setSubject]  = useState("");
  const [message,  setMessage]  = useState("");
  const [revealed, setReveal]   = useState(false);
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState("");

  async function handleSendNow() {
    if (!email || !message) {
      setError("Email and message are required.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch {
      setError("Something went wrong. Try the mail app below.");
    } finally {
      setSending(false);
    }
  }

  function handleMailApp() {
    const params = new URLSearchParams();
    if (email)   params.set("from",    email);
    if (subject) params.set("subject", subject);
    if (message) params.set("body",    message);
    const query = params.toString() ? `?${params.toString()}` : "";
    window.location.href = `mailto:hello@johnhib.com${query}`;
    setOpen(false);
  }

  function handleClose() {
    setOpen(false);
    setReveal(false);
    setSent(false);
    setError("");
    setName(""); setEmail(""); setSubject(""); setMessage("");
  }

  const inputStyle: React.CSSProperties = {
    width:        "100%",
    background:   "#1a1a1a",
    border:       "1px solid rgba(255,255,255,0.08)",
    borderRadius: "3px",
    padding:      "8px 10px",
    fontFamily:   "var(--font-jetbrains, monospace)",
    fontSize:     "0.75rem",
    color:        "#e8e6e1",
    outline:      "none",
    boxSizing:    "border-box",
  };

  // Shared easing for the reveal — both fields move as one
  const EASE = "0.32s cubic-bezier(0.4, 0, 0.2, 1)";

  const revealStyle: React.CSSProperties = {
    overflow:   "hidden",
    maxHeight:  revealed ? "60px" : "0px",
    opacity:    revealed ? 1 : 0,
    marginTop:  revealed ? "0.75rem" : "0",
    transition: `max-height ${EASE}, opacity ${EASE}, margin-top ${EASE}`,
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position:        "fixed",
          bottom:          "clamp(1.25rem, 3vw, 2rem)",
          right:           "clamp(1.25rem, 3vw, 2rem)",
          zIndex:          10,
          background:      "none",
          border:          "none",
          padding:         0,
          cursor:          "pointer",
          fontFamily:      "var(--font-jetbrains, monospace)",
          fontSize:        "0.79rem",
          color:           "var(--muted, #6B6B6B)",
          letterSpacing:   "0.06em",
          opacity:         0.4,
          transition:      "opacity 0.2s ease",
          userSelect:      "none",
          lineHeight:      1,
          display:         "block",
          transform:       "translateZ(0)",
          WebkitTransform: "translateZ(0)",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.4")}
        data-corner-anchor=""
        aria-label="Get in touch"
      >
        contact
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={handleClose}
          style={{
            position:       "fixed",
            inset:          0,
            zIndex:         100,
            background:     "rgba(8,8,8,0.85)",
            display:        "flex",
            alignItems:     "flex-start",
            justifyContent: "center",
            paddingTop:     "clamp(4rem, 12vh, 8rem)",
            paddingLeft:    "clamp(1rem, 4vw, 2rem)",
            paddingRight:   "clamp(1rem, 4vw, 2rem)",
            paddingBottom:  "clamp(1rem, 4vw, 2rem)",
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
                onClick={handleClose}
                style={{ background: "none", border: "none", color: "var(--muted, #6B6B6B)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0 }}
              >
                ×
              </button>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column" }}>

              {/* Your name — triggers reveal on first focus */}
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onFocus={() => setReveal(true)}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />

              {/* Your email — eases in after name focused */}
              <div style={revealStyle}>
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ ...inputStyle, width: "100%" }}
                />
              </div>

              {/* Subject */}
              <div style={{ marginTop: "0.75rem" }}>
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Message */}
              <div style={{ marginTop: "0.75rem" }}>
                <textarea
                  placeholder="Message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Send now — eases in in parallel with email field */}
              <div style={{
                overflow:   "hidden",
                maxHeight:  revealed ? "60px" : "0px",
                opacity:    revealed ? 1 : 0,
                marginTop:  revealed ? "0.75rem" : "0",
                transition: `max-height ${EASE}, opacity ${EASE}, margin-top ${EASE}`,
              }}>
                <button
                  onClick={handleSendNow}
                  disabled={sending || sent}
                  style={{
                    width:         "100%",
                    background:    sent ? "#2a5a2a" : "var(--gold, #C8A96E)",
                    border:        "none",
                    borderRadius:  "3px",
                    padding:       "10px",
                    fontFamily:    "var(--font-jetbrains, monospace)",
                    fontSize:      "0.7rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color:         sent ? "#aaffaa" : "#0a0a0a",
                    cursor:        sending ? "wait" : "pointer",
                    fontWeight:    600,
                    transition:    "background 0.3s ease, color 0.3s ease",
                  }}
                >
                  {sent ? "Sent ✓" : sending ? "Sending…" : "Send now"}
                </button>
              </div>

              {/* Error */}
              {error && (
                <p style={{
                  marginTop:  "0.5rem",
                  fontSize:   "0.65rem",
                  color:      "#ff6b6b",
                  fontFamily: "var(--font-jetbrains, monospace)",
                }}>
                  {error}
                </p>
              )}

              {/* Open in mail app — always visible */}
              <button
                onClick={handleMailApp}
                style={{
                  marginTop:     "0.75rem",
                  width:         "100%",
                  background:    "none",
                  border:        "1px solid rgba(255,255,255,0.08)",
                  borderRadius:  "3px",
                  padding:       "10px",
                  fontFamily:    "var(--font-jetbrains, monospace)",
                  fontSize:      "0.7rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color:         "var(--muted, #6B6B6B)",
                  cursor:        "pointer",
                  fontWeight:    400,
                }}
              >
                Open in mail app →
              </button>

            </div>

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
