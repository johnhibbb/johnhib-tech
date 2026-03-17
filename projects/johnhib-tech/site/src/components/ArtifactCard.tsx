'use client';

import { useEffect, useRef } from 'react';
import type { Artifact } from '@/lib/articles';
import ArtifactViewer from './ArtifactViewer';

interface ArtifactCardProps {
  artifact: Artifact;
  isOpen: boolean;
  onToggle: () => void;
}

const BADGE_STYLES: Record<string, { background: string; color: string }> = {
  config:   { background: '#e8f0fe', color: '#1a56db' },
  shell:    { background: '#e8faf0', color: '#1a7a4a' },
  file:     { background: '#f5f0ff', color: '#6b3fa0' },
  incident: { background: '#fef0f0', color: '#c0392b' },
};

export default function ArtifactCard({ artifact, isOpen, onToggle }: ArtifactCardProps) {
  const badgeStyle = BADGE_STYLES[artifact.type] ?? { background: '#f0f0f0', color: '#444444' };
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (isOpen) {
      el.style.maxHeight = el.scrollHeight + 'px';
    } else {
      el.style.maxHeight = '0';
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const el = bodyRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.style.maxHeight = el.scrollHeight + 'px';
    }, 50);
    return () => clearTimeout(t);
  }, [isOpen, artifact]);

  return (
    <div
      style={{
        background: '#f8f8f8',
        border: '1px solid #e8e8e8',
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '12px',
      }}
    >
      {/* Card Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Top row: chevron + filename + badge + (collapsed: description) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              display: 'inline-block',
              transition: 'transform 0.2s ease',
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              color: '#666666',
              fontSize: '14px',
              flexShrink: 0,
            }}
          >
            ›
          </span>

          <span
            style={{
              fontFamily: 'ui-monospace, "Cascadia Code", Menlo, Consolas, monospace',
              fontSize: '14px',
              color: '#111111',
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {artifact.filename}
          </span>

          <span
            style={{
              ...badgeStyle,
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              padding: '2px 7px',
              borderRadius: '3px',
              flexShrink: 0,
            }}
          >
            {artifact.type}
          </span>

          {/* Description inline — only when collapsed */}
          {!isOpen && (
            <span
              style={{
                fontSize: '13px',
                color: '#666666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {artifact.description}
            </span>
          )}
        </div>

        {/* Description below title — only when expanded */}
        {isOpen && (
          <div
            style={{
              marginTop: '6px',
              paddingLeft: '26px', // align with filename (past chevron)
              fontSize: '13px',
              color: '#666666',
            }}
          >
            {artifact.description}
          </div>
        )}
      </button>

      {/* Expandable Body */}
      <div
        ref={bodyRef}
        style={{
          maxHeight: 0,
          overflow: 'hidden',
          transition: 'max-height 0.2s ease',
        }}
      >
        <div style={{ padding: '0 16px 16px 16px' }}>
          <ArtifactViewer artifact={artifact} />
        </div>
      </div>
    </div>
  );
}
