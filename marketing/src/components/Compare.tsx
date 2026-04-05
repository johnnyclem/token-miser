import React from 'react';
import { oe, Ue } from '../theme';
import { useReveal } from '../hooks';

const features = [
  'Cost breakdown by category',
  'Per-tool analysis',
  'Cache hit rate tracking',
  'Optimization suggestions',
  'A/B test harnesses',
  'Config diff viewer',
  'Interactive dashboard',
  'Zero config',
  'Pricing',
];

type Tool = {
  name: string;
  values: Record<string, string>;
};

const tools: Tool[] = [
  {
    name: 'token-miser',
    values: {
      'Cost breakdown by category': '\u2713',
      'Per-tool analysis': '\u2713',
      'Cache hit rate tracking': '\u2713',
      'Optimization suggestions': '\u2713',
      'A/B test harnesses': '\u2713',
      'Config diff viewer': '\u2713',
      'Interactive dashboard': '\u2713',
      'Zero config': '\u2713',
      'Pricing': 'Free / MIT',
    },
  },
  {
    name: 'ccusage',
    values: {
      'Cost breakdown by category': '\u2713',
      'Per-tool analysis': '\u2014',
      'Cache hit rate tracking': '\u2014',
      'Optimization suggestions': '\u2014',
      'A/B test harnesses': '\u2014',
      'Config diff viewer': '\u2014',
      'Interactive dashboard': '\u2713',
      'Zero config': '\u2713',
      'Pricing': 'Free / MIT',
    },
  },
  {
    name: 'tokscale',
    values: {
      'Cost breakdown by category': '\u2713',
      'Per-tool analysis': '\u2713',
      'Cache hit rate tracking': '\u2014',
      'Optimization suggestions': '\u2713',
      'A/B test harnesses': '\u2014',
      'Config diff viewer': '\u2014',
      'Interactive dashboard': '\u2014',
      'Zero config': '\u2014',
      'Pricing': 'Free / MIT',
    },
  },
  {
    name: 'claude-code-log',
    values: {
      'Cost breakdown by category': '\u2713',
      'Per-tool analysis': '\u2014',
      'Cache hit rate tracking': '\u2014',
      'Optimization suggestions': '\u2014',
      'A/B test harnesses': '\u2014',
      'Config diff viewer': '\u2014',
      'Interactive dashboard': '\u2014',
      'Zero config': '\u2713',
      'Pricing': 'Free / MIT',
    },
  },
];

const cellStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 'clamp(12px, 1.2vw, 14px)',
  fontFamily: Ue.sans,
  borderBottom: `1px solid ${oe.border}`,
  whiteSpace: 'nowrap',
};

const Compare: React.FC = () => {
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
        How it compares
      </h2>
      <p
        style={{
          fontSize: 'clamp(14px, 1.4vw, 16px)',
          color: oe.textDim,
          fontFamily: Ue.sans,
          textAlign: 'center',
          marginBottom: 40,
          lineHeight: 1.5,
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Other tools show you what you spent. token-miser tells you{' '}
        <span style={{ color: oe.accent, fontWeight: 600 }}>how to spend less</span>.
      </p>

      <div
        style={{
          overflowX: 'auto',
          borderRadius: 12,
          border: `1px solid ${oe.border}`,
          background: oe.surface,
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 600,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  ...cellStyle,
                  textAlign: 'left',
                  color: oe.textDim,
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Feature
              </th>
              {tools.map((t) => (
                <th
                  key={t.name}
                  style={{
                    ...cellStyle,
                    textAlign: 'center',
                    color: t.name === 'token-miser' ? oe.accent : oe.text,
                    fontWeight: 700,
                    fontFamily: Ue.mono,
                    fontSize: 'clamp(12px, 1.2vw, 14px)',
                  }}
                >
                  {t.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feat) => (
              <tr key={feat}>
                <td
                  style={{
                    ...cellStyle,
                    color: oe.text,
                    fontWeight: 500,
                  }}
                >
                  {feat}
                </td>
                {tools.map((t) => {
                  const val = t.values[feat] || '\u2014';
                  const isCheck = val === '\u2713';
                  const isDash = val === '\u2014';
                  return (
                    <td
                      key={t.name}
                      style={{
                        ...cellStyle,
                        textAlign: 'center',
                        color: isCheck
                          ? t.name === 'token-miser'
                            ? oe.green
                            : oe.green
                          : isDash
                          ? oe.textDim
                          : oe.text,
                        fontSize: isCheck || isDash ? 18 : 'clamp(12px, 1.2vw, 14px)',
                        fontWeight: isCheck ? 700 : 400,
                      }}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Compare;
