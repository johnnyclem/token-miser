import React from 'react';
import { oe, Ue } from '../theme';
import { useReveal } from '../hooks';

const features = [
  {
    title: 'Aggregate',
    description:
      'Reads your ~/.claude/projects/ JSONL logs. Aggregates costs, token flows, cache rates, tool usage, and model splits across all sessions.',
    color: oe.accent,
  },
  {
    title: 'Suggest',
    description:
      'Generates prioritized optimization suggestions with estimated savings percentages, effort levels, and implementation instructions.',
    color: oe.green,
  },
  {
    title: 'Compare',
    description:
      'Compare two harness snapshots side-by-side with cost deltas, cache rate changes, and config diffs. Data-driven decisions, not vibes.',
    color: oe.orange,
  },
];

const HowItWorks: React.FC = () => {
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
          marginBottom: 48,
        }}
      >
        How It Works
      </h2>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          justifyContent: 'center',
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              flex: '1 1 260px',
              maxWidth: 300,
              background: oe.surface,
              border: `1px solid ${oe.border}`,
              borderRadius: 12,
              padding: 28,
            }}
          >
            <div
              style={{
                fontSize: 'clamp(16px, 2vw, 20px)',
                fontWeight: 700,
                color: f.color,
                fontFamily: Ue.sans,
                marginBottom: 12,
              }}
            >
              {i + 1}. {f.title}
            </div>
            <p
              style={{
                fontSize: 14,
                color: oe.textDim,
                fontFamily: Ue.sans,
                lineHeight: 1.6,
              }}
            >
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
