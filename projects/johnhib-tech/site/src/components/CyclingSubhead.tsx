"use client";

import { useState, useCallback } from "react";

const SUBHEADS = [
  "Documenting what works before I forget how I got here.",
  "The gap between the promise and what it actually delivers is where the work lives.",
  "No manual. Just what breaks and what doesn't.",
];

export default function CyclingSubhead() {
  const [index,   setIndex]   = useState(0);
  const [visible, setVisible] = useState(true);

  const handleClick = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIndex(i => (i + 1) % SUBHEADS.length);
      setVisible(true);
    }, 200);
  }, []);

  return (
    <button
      onClick={handleClick}
      style={{
        background:  "none",
        border:      "none",
        padding:     0,
        margin:      0,
        cursor:      "crosshair",
        textAlign:   "left",
        display:     "block",
      }}
      aria-label="Cycle through lines"
    >
      <p
        style={{
          color:      "#666666",
          fontSize:   "1rem",
          lineHeight: 1.5,
          margin:     0,
          opacity:    visible ? 1 : 0,
          transition: "opacity 0.2s ease",
          userSelect: "none",
        }}
      >
        {SUBHEADS[index]}
      </p>
    </button>
  );
}
