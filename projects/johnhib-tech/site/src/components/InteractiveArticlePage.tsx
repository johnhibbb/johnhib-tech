'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { InteractiveArticle } from '@/lib/articles';
import ArtifactCard from './ArtifactCard';

interface InteractiveArticlePageProps {
  article: InteractiveArticle;
}

export default function InteractiveArticlePage({ article }: InteractiveArticlePageProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  function handleToggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
      {/* Nav */}
      <nav style={{ marginBottom: '48px' }}>
        <Link
          href="/"
          style={{ color: '#0066cc', fontSize: '14px', textDecoration: 'none' }}
        >
          ← johnhib.tech
        </Link>
      </nav>

      {/* Header */}
      <header style={{ marginBottom: '48px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            lineHeight: 1.3,
            color: '#111111',
            marginBottom: '12px',
          }}
        >
          {article.title}
        </h1>
        <p style={{ fontSize: '14px', color: '#666666', margin: 0 }}>{article.date}</p>
      </header>

      {/* Intro */}
      <p
        style={{
          fontSize: '16px',
          lineHeight: '1.7',
          color: '#111111',
          marginBottom: '40px',
          maxWidth: '640px',
        }}
      >
        {article.intro}
      </p>

      {/* Artifacts */}
      <section>
        <h2
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#888888',
            marginBottom: '16px',
          }}
        >
          Artifacts
        </h2>
        {article.artifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            isOpen={openId === artifact.id}
            onToggle={() => handleToggle(artifact.id)}
          />
        ))}
      </section>
    </main>
  );
}
