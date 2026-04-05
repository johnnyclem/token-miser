import React from 'react';
import { oe, Ue } from '../theme';
import { useReveal } from '../hooks';

const steps = [
  {
    title: 'Install',
    command: 'npm install -g token-miser',
    note: 'Or use npx -- no install needed.',
  },
  {
    title: 'Run first analysis',
    command: 'token-miser analyze',
    note: 'Scans ~/.claude/projects/ automatically. Zero configuration.',
  },
  {
    title: 'Get suggestions',
    command: 'token-miser suggest',
    note: 'Prioritized by estimated savings. Each with effort level and instructions.',
  },
  {
    title: 'Save baseline',
    command: 'token-miser harness save baseline "Before optimization"',
    note: 'Snapshots your CLAUDE.md, .claudeignore, and settings.json.',
  },
  {
    title: 'Compare',
    command: 'token-miser compare baseline optimized-v1',
    note: 'Run 5+ sessions, save a new harness, then compare side-by-side.',
  },
];

const QuickStart: React.FC = () => {
  const ref = useReveal();

  return (
    <section
      ref={ref}
      className="section-reveal"
      style={{
        padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 64px)',
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      <h2
        style={{
          fontSize: 'clamp(24px, 3.5vw, 36px)',
          fontWeight: 700,
          color: oe.text,
          fontFamily: Ue.sans,
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        Get started in 2 minutes
      </h2>
      <p
        style={{
          fontSize: 'clamp(14px, 1.4vw, 16px)',
          color: oe.textDim,
          fontFamily: Ue.sans,
          textAlign: 'center',
          marginBottom: 48,
          lineHeight: 1.5,
          maxWidth: 520,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        From install to first insight. No API keys, no config files, no sign-up.
      </p>

      <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
        {/* Vertical connecting line */}
        <div
          style={{
            position: 'absolute',
            left: 19,
            top: 40,
            bottom: 40,
            width: 2,
            background: oe.border,
          }}
        />

        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 20,
              marginBottom: i < steps.length - 1 ? 32 : 0,
              position: 'relative',
            }}
          >
            {/* Step number circle */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: oe.surface,
                border: `2px solid ${oe.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: oe.accent,
                fontFamily: Ue.mono,
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              {i + 1}
            </div>

            {/* Step content */}
            <div style={{ flex: 1, paddingTop: 2 }}>
              <div
                style={{
                  fontSize: 'clamp(16px, 1.8vw, 18px)',
                  fontWeight: 700,
                  color: oe.text,
                  fontFamily: Ue.sans,
                  marginBottom: 8,
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  background: oe.bg,
                  border: `1px solid ${oe.border}`,
                  borderRadius: 8,
                  padding: '10px 16px',
                  marginBottom: 8,
                  overflowX: 'auto',
                }}
              >
                <code
                  style={{
                    fontSize: 'clamp(12px, 1.2vw, 14px)',
                    color: oe.green,
                    fontFamily: Ue.mono,
                    whiteSpace: 'nowrap',
                  }}
                >
                  $ {step.command}
                </code>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: oe.textDim,
                  fontFamily: Ue.sans,
                  lineHeight: 1.5,
                }}
              >
                {step.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuickStart;
