import React from 'react';
import { L, he } from '../theme';
import { AggregateData } from '../data';
import SectionTitle from './SectionTitle';

interface SuggestionsProps {
  data: AggregateData;
}

const effortColors: Record<string, string> = {
  low: L.green,
  medium: L.orange,
  high: L.red,
};

const Suggestions: React.FC<SuggestionsProps> = ({ data }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Suggestions List */}
      <div
        style={{
          background: L.surface,
          border: `1px solid ${L.border}`,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>Optimization Suggestions</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.suggestions.map((s, i) => (
            <div
              key={i}
              style={{
                background: L.bg,
                border: `1px solid ${L.border}`,
                borderRadius: 8,
                padding: '16px 20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: L.text,
                    flex: 1,
                    minWidth: 200,
                  }}
                >
                  {s.title}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: L.green,
                    background: 'rgba(46,204,113,0.1)',
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontFamily: he.mono,
                  }}
                >
                  {s.savings}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: effortColors[s.effort] || L.textDim,
                    background: `${effortColors[s.effort] || L.textDim}18`,
                    padding: '3px 10px',
                    borderRadius: 12,
                  }}
                >
                  {s.effort} effort
                </span>
              </div>
              <div style={{ fontSize: 12, color: L.textDim, lineHeight: 1.6 }}>
                {s.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to A/B test */}
      <div
        style={{
          background: L.surface,
          border: `1px solid ${L.border}`,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>How to A/B Test</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
          {[
            {
              step: 1,
              text: 'Create a baseline harness config:',
              cmd: 'token-miser harness create baseline --model claude-sonnet-4-20250514',
            },
            {
              step: 2,
              text: 'Create a variant with your optimization:',
              cmd: 'token-miser harness create optimized --model claude-sonnet-4-20250514 --cache-control on',
            },
            {
              step: 3,
              text: 'Run sessions under each harness:',
              cmd: 'token-miser harness run baseline --sessions 5',
            },
            {
              step: 4,
              text: 'Compare the results:',
              cmd: 'token-miser harness compare baseline optimized',
            },
          ].map(({ step, text, cmd }) => (
            <div key={step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: L.accentSoft,
                  color: L.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: he.mono,
                  flexShrink: 0,
                }}
              >
                {step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: L.text, marginBottom: 6 }}>{text}</div>
                <code
                  style={{
                    display: 'block',
                    background: L.bg,
                    border: `1px solid ${L.border}`,
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: 11,
                    color: L.accent,
                    fontFamily: he.mono,
                    overflowX: 'auto',
                  }}
                >
                  {cmd}
                </code>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 20,
            padding: '12px 16px',
            background: L.accentSoft,
            borderRadius: 8,
            fontSize: 12,
            color: L.textDim,
          }}
        >
          For full details on optimization strategies, run{' '}
          <code style={{ color: L.accent, fontFamily: he.mono }}>token-miser prd</code>
        </div>
      </div>
    </div>
  );
};

export default Suggestions;
