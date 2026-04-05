import React from 'react';
import { oe, Ue } from '../theme';
import { useReveal } from '../hooks';

const Hero: React.FC = () => {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      className="section-reveal"
      style={{
        padding: 'clamp(48px, 10vw, 120px) clamp(20px, 5vw, 64px)',
        maxWidth: 960,
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${oe.accent}, ${oe.purple})`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          fontWeight: 700,
          color: '#fff',
          fontFamily: Ue.mono,
          marginBottom: 32,
        }}
      >
        T
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: 'clamp(28px, 4.5vw, 52px)',
          fontWeight: 700,
          lineHeight: 1.15,
          color: oe.text,
          fontFamily: Ue.sans,
          marginBottom: 20,
          maxWidth: 800,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Your biggest optimization lever isn't what Claude writes &mdash; it's what Claude{' '}
        <span style={{ color: oe.accent }}>reads</span>.
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: oe.textDim,
          fontFamily: Ue.sans,
          marginBottom: 40,
          maxWidth: 560,
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.5,
        }}
      >
        Ship with Claude Code for analyzing your own usage
      </p>

      {/* Stat callout */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <span
          style={{
            fontSize: 'clamp(48px, 8vw, 80px)',
            fontWeight: 700,
            color: oe.red,
            fontFamily: Ue.mono,
            lineHeight: 1,
          }}
        >
          73%
        </span>
        <span
          style={{
            fontSize: 'clamp(14px, 1.5vw, 18px)',
            color: oe.textDim,
            fontFamily: Ue.sans,
            maxWidth: 260,
            textAlign: 'left',
            lineHeight: 1.4,
          }}
        >
          Of token spend is input tokens (reading, not writing)
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 'clamp(14px, 1.4vw, 16px)',
          color: oe.textDim,
          fontFamily: Ue.sans,
          marginBottom: 32,
          maxWidth: 640,
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6,
        }}
      >
        Reads your <code style={{ color: oe.accent, fontFamily: Ue.mono }}>~/.claude/projects/</code>{' '}
        JSONL logs. Aggregates costs, token flows, cache rates, tool usage, and model splits across
        all sessions.
      </p>

      {/* Code block */}
      <div
        style={{
          background: oe.surface,
          border: `1px solid ${oe.border}`,
          borderRadius: 10,
          padding: '18px 28px',
          display: 'inline-block',
          marginBottom: 40,
        }}
      >
        <code
          style={{
            fontSize: 'clamp(14px, 1.5vw, 18px)',
            color: oe.green,
            fontFamily: Ue.mono,
          }}
        >
          $ npx token-miser analyze
        </code>
      </div>

      {/* Average spend */}
      <div style={{ marginBottom: 32 }}>
        <p
          style={{
            fontSize: 14,
            color: oe.textDim,
            fontFamily: Ue.sans,
            marginBottom: 8,
          }}
        >
          Average Claude Code spend for active developers
        </p>
        <span
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700,
            color: oe.orange,
            fontFamily: Ue.mono,
          }}
        >
          $0.97/day avg
        </span>
      </div>

      {/* Install commands */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: oe.surface,
            border: `1px solid ${oe.border}`,
            borderRadius: 8,
            padding: '12px 20px',
          }}
        >
          <code style={{ fontSize: 14, color: oe.text, fontFamily: Ue.mono }}>
            npm install -g token-miser
          </code>
        </div>
        <div
          style={{
            background: oe.surface,
            border: `1px solid ${oe.border}`,
            borderRadius: 8,
            padding: '12px 20px',
          }}
        >
          <code style={{ fontSize: 14, color: oe.text, fontFamily: Ue.mono }}>
            npx token-miser analyze
          </code>
        </div>
      </div>
    </section>
  );
};

export default Hero;
