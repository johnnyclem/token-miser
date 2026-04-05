import React from 'react';
import { oe, Ue } from '../theme';
import { useReveal } from '../hooks';

const stats = [
  {
    value: '$0.97/day avg',
    label: 'Average Claude Code spend',
    color: oe.orange,
  },
  {
    value: '73%',
    label: 'Input tokens (reading)',
    color: oe.red,
  },
  {
    value: '0%',
    label: 'Most teams have no visibility into where this goes.',
    color: oe.textDim,
    hideValue: true,
  },
];

const Stats: React.FC = () => {
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
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          justifyContent: 'center',
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              flex: '1 1 240px',
              maxWidth: 300,
              background: oe.surface,
              border: `1px solid ${oe.border}`,
              borderRadius: 12,
              padding: 28,
              textAlign: 'center',
            }}
          >
            {!s.hideValue && (
              <div
                style={{
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: Ue.mono,
                  marginBottom: 8,
                }}
              >
                {s.value}
              </div>
            )}
            <div
              style={{
                fontSize: 'clamp(13px, 1.3vw, 15px)',
                color: s.hideValue ? oe.text : oe.textDim,
                fontFamily: Ue.sans,
                lineHeight: 1.5,
                fontWeight: s.hideValue ? 600 : 400,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
