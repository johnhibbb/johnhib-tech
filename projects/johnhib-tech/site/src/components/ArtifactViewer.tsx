'use client';

import { useState } from 'react';
import type { Artifact, Annotation } from '@/lib/articles';

interface ArtifactViewerProps {
  artifact: Artifact;
}

interface Segment {
  text: string;
  annotationId: string | null;
}

function buildSegments(content: string, annotations: Annotation[]): Segment[] {
  const positioned = annotations
    .map((ann) => ({ ann, idx: content.indexOf(ann.anchor) }))
    .filter(({ idx }) => idx !== -1)
    .sort((a, b) => a.idx - b.idx);

  const segments: Segment[] = [];
  let cursor = 0;

  for (const { ann, idx } of positioned) {
    if (idx < cursor) continue;
    if (idx > cursor) {
      segments.push({ text: content.slice(cursor, idx), annotationId: null });
    }
    segments.push({ text: ann.anchor, annotationId: ann.id });
    cursor = idx + ann.anchor.length;
  }

  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor), annotationId: null });
  }

  return segments;
}

interface TooltipState {
  id: string;
  x: number;
  y: number;
}

export default function ArtifactViewer({ artifact }: ArtifactViewerProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const activeAnnotation = tooltip
    ? artifact.annotations.find((a) => a.id === tooltip.id) ?? null
    : null;

  const segments = buildSegments(artifact.content, artifact.annotations);
  const contentLines = artifact.content.split('\n');

  function renderLines() {
    // Build a char-indexed map of annotationId
    const segMap: Array<string | null> = [];
    for (const seg of segments) {
      for (let i = 0; i < seg.text.length; i++) {
        segMap.push(seg.annotationId);
      }
    }

    let charPos = 0;
    return contentLines.map((line, lineIdx) => {
      const lineChars = line.length + (lineIdx < contentLines.length - 1 ? 1 : 0);
      const lineSegs: Segment[] = [];
      let cur = 0;

      while (cur < line.length) {
        const annId = charPos + cur < segMap.length ? segMap[charPos + cur] : null;
        let end = cur + 1;
        while (end < line.length) {
          const nextAnn = charPos + end < segMap.length ? segMap[charPos + end] : null;
          if (nextAnn !== annId) break;
          end++;
        }
        lineSegs.push({ text: line.slice(cur, end), annotationId: annId });
        cur = end;
      }

      charPos += lineChars;

      return (
        <div key={lineIdx} style={{ display: 'flex', minHeight: '1.5em' }}>
          <span
            style={{
              userSelect: 'none',
              minWidth: '2.5rem',
              paddingRight: '1rem',
              textAlign: 'right',
              color: '#aaaaaa',
              flexShrink: 0,
            }}
          >
            {lineIdx + 1}
          </span>
          <span style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {lineSegs.map((seg, i) => {
              if (!seg.annotationId) return <span key={i}>{seg.text}</span>;

              const isActive = tooltip?.id === seg.annotationId;
              return (
                <mark
                  key={i}
                  onMouseMove={(e) =>
                    setTooltip({ id: seg.annotationId!, x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    background: isActive ? '#ffd700' : '#fff3cd',
                    cursor: 'default',
                    borderRadius: '2px',
                    padding: '0 1px',
                    transition: 'background 0.15s ease',
                    position: 'relative',
                    zIndex: 101,
                  }}
                >
                  {seg.text}
                </mark>
              );
            })}
          </span>
        </div>
      );
    });
  }

  // Clamp tooltip so it doesn't go off-screen right edge
  const tooltipWidth = 340;
  const tooltipLeft = tooltip
    ? Math.min(tooltip.x + 16, (typeof window !== 'undefined' ? window.innerWidth : 1200) - tooltipWidth - 16)
    : 0;
  const tooltipTop = tooltip ? tooltip.y - 12 : 0;

  return (
    <>
      {/* Dark overlay — always mounted, fades in/out via opacity */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.12)',
          zIndex: 99,
          pointerEvents: 'none',
          opacity: tooltip ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      />

      {/* Tooltip — fixed position, above overlay, near cursor, fades in/out */}
      <div
        style={{
          position: 'fixed',
          left: tooltipLeft,
          top: tooltipTop,
          transform: 'translateY(-100%)',
          zIndex: 102,
          width: tooltipWidth,
          background: '#f0f4ff',
          borderLeft: '3px solid #0066cc',
          borderRadius: '0 6px 6px 0',
          padding: '12px 16px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.22)',
          fontSize: '13px',
          lineHeight: '1.7',
          color: '#111111',
          pointerEvents: 'none',
          opacity: tooltip && activeAnnotation ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        {activeAnnotation?.note ?? ''}
      </div>

      {/* Code block — z-index above overlay so text is visible underneath tooltip */}
      <div style={{ position: 'relative', zIndex: 100 }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e8e8e8',
            borderRadius: '4px',
            overflow: 'auto',
            padding: '16px',
            fontFamily:
              'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
            fontSize: '13px',
            lineHeight: '1.5',
            color: '#111111',
          }}
        >
          {renderLines()}
        </div>

        {artifact.annotations.length > 0 && (
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#888888' }}>
            Hover highlighted text to read annotations.
          </p>
        )}
      </div>
    </>
  );
}
