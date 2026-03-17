'use client';

import { useState } from 'react';
import type { PromptCard as PromptCardType } from '@/lib/articles';

interface PromptCardProps {
  card: PromptCardType;
}

export default function PromptCard({ card }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(card.prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const label = card.label ?? 'Try';

  return (
    <div
      style={{
        marginTop:    '0',
      marginBottom: '12px',
        border:       '1px solid rgba(180, 140, 60, 0.35)',
        borderRadius: '4px',
        overflow:     'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display:         'flex',
          justifyContent:  'space-between',
          alignItems:      'center',
          padding:         '10px 16px',
          background:      'rgba(200, 169, 110, 0.07)',
          borderBottom:    '1px solid rgba(180, 140, 60, 0.2)',
        }}
      >
        <span
          style={{
            fontFamily:    'var(--font-mono, monospace)',
            fontSize:      '10px',
            fontWeight:    600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         '#C8A96E',
          }}
        >
          {label}
        </span>

        <button
          onClick={handleCopy}
          style={{
            background:    'none',
            border:        '1px solid rgba(180, 140, 60, 0.3)',
            borderRadius:  '3px',
            padding:       '3px 10px',
            cursor:        'pointer',
            fontFamily:    'var(--font-mono, monospace)',
            fontSize:      '10px',
            letterSpacing: '0.06em',
            color:         copied ? '#C8A96E' : 'rgba(180, 140, 60, 0.6)',
            transition:    'color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={e => {
            if (!copied) {
              e.currentTarget.style.color = '#C8A96E';
              e.currentTarget.style.borderColor = 'rgba(180,140,60,0.6)';
            }
          }}
          onMouseLeave={e => {
            if (!copied) {
              e.currentTarget.style.color = 'rgba(180,140,60,0.6)';
              e.currentTarget.style.borderColor = 'rgba(180,140,60,0.3)';
            }
          }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>

      {/* Prompt body */}
      <div style={{ padding: '20px 20px 22px' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize:   '13px',
            lineHeight: '1.75',
            color:      '#999',
            margin:     0,
            whiteSpace: 'pre-wrap',
          }}
        >
          {card.prompt}
        </p>
      </div>
    </div>
  );
}
