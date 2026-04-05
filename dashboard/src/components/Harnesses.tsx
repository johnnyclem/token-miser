import React, { useState, useMemo } from 'react';
import { L, he } from '../theme';
import { AggregateData, HarnessConfig } from '../data';
import SectionTitle from './SectionTitle';

interface HarnessesProps {
  data: AggregateData;
}

const Harnesses: React.FC<HarnessesProps> = ({ data }) => {
  const [selectedA, setSelectedA] = useState<number>(0);
  const [selectedB, setSelectedB] = useState<number>(data.harnesses.length > 2 ? 2 : 1);

  const harnessA = data.harnesses[selectedA];
  const harnessB = data.harnesses[selectedB];

  const configKeys = useMemo(() => {
    const keys = new Set<string>();
    data.harnesses.forEach((h) => Object.keys(h.config).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [data.harnesses]);

  const winner = harnessA.costPerSession <= harnessB.costPerSession ? harnessA : harnessB;
  const loser = winner === harnessA ? harnessB : harnessA;
  const savings = ((1 - winner.costPerSession / loser.costPerSession) * 100).toFixed(0);

  const comparisonRows: { label: string; a: string; b: string; better: 'a' | 'b' | 'tie' }[] = [
    {
      label: 'Sessions',
      a: String(harnessA.sessions),
      b: String(harnessB.sessions),
      better: 'tie',
    },
    {
      label: 'Total Cost',
      a: `$${harnessA.totalCost.toFixed(2)}`,
      b: `$${harnessB.totalCost.toFixed(2)}`,
      better: harnessA.totalCost < harnessB.totalCost ? 'a' : harnessA.totalCost > harnessB.totalCost ? 'b' : 'tie',
    },
    {
      label: 'Cost / Session',
      a: `$${harnessA.costPerSession.toFixed(2)}`,
      b: `$${harnessB.costPerSession.toFixed(2)}`,
      better: harnessA.costPerSession < harnessB.costPerSession ? 'a' : harnessA.costPerSession > harnessB.costPerSession ? 'b' : 'tie',
    },
    {
      label: 'Total Tokens',
      a: harnessA.totalTokens.toLocaleString(),
      b: harnessB.totalTokens.toLocaleString(),
      better: harnessA.totalTokens < harnessB.totalTokens ? 'a' : harnessA.totalTokens > harnessB.totalTokens ? 'b' : 'tie',
    },
    {
      label: 'Cache Hit Rate',
      a: `${(harnessA.cacheHitRate * 100).toFixed(0)}%`,
      b: `${(harnessB.cacheHitRate * 100).toFixed(0)}%`,
      better: harnessA.cacheHitRate > harnessB.cacheHitRate ? 'a' : harnessA.cacheHitRate < harnessB.cacheHitRate ? 'b' : 'tie',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Harness Selection */}
      <div
        style={{
          background: L.surface,
          border: `1px solid ${L.border}`,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>Select Harnesses to Compare</SectionTitle>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {data.harnesses.map((h, i) => {
            const isA = selectedA === i;
            const isB = selectedB === i;
            return (
              <div
                key={h.name}
                style={{
                  background: isA || isB ? L.accentSoft : L.bg,
                  border: `1px solid ${isA ? L.accent : isB ? L.purple : L.border}`,
                  borderRadius: 8,
                  padding: '14px 18px',
                  flex: '1 1 200px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {(isA || isB) && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 10,
                      fontSize: 10,
                      fontWeight: 700,
                      color: isA ? L.accent : L.purple,
                      fontFamily: he.mono,
                    }}
                  >
                    {isA ? 'A' : 'B'}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: L.text,
                    fontFamily: he.mono,
                    marginBottom: 6,
                  }}
                >
                  {h.name}
                </div>
                <div style={{ fontSize: 11, color: L.textDim, marginBottom: 8 }}>
                  {h.sessions} sessions &middot; ${h.costPerSession.toFixed(2)}/sess
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setSelectedA(i)}
                    style={{
                      padding: '4px 12px',
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: he.mono,
                      color: isA ? '#fff' : L.accent,
                      background: isA ? L.accent : 'transparent',
                      border: `1px solid ${L.accent}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Set A
                  </button>
                  <button
                    onClick={() => setSelectedB(i)}
                    style={{
                      padding: '4px 12px',
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: he.mono,
                      color: isB ? '#fff' : L.purple,
                      background: isB ? L.purple : 'transparent',
                      border: `1px solid ${L.purple}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Set B
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div
        style={{
          background: L.surface,
          border: `1px solid ${L.border}`,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>
          Comparison: {harnessA.name} vs {harnessB.name}
        </SectionTitle>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
            fontFamily: he.mono,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Metric</th>
              <th style={{ ...thStyle, color: L.accent }}>{harnessA.name} (A)</th>
              <th style={{ ...thStyle, color: L.purple }}>{harnessB.name} (B)</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.label}>
                <td style={tdStyle}>{row.label}</td>
                <td
                  style={{
                    ...tdStyle,
                    color: row.better === 'a' ? L.green : L.text,
                    fontWeight: row.better === 'a' ? 600 : 400,
                  }}
                >
                  {row.a}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    color: row.better === 'b' ? L.green : L.text,
                    fontWeight: row.better === 'b' ? 600 : 400,
                  }}
                >
                  {row.b}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Winner */}
        <div
          style={{
            marginTop: 20,
            padding: '14px 18px',
            background: 'rgba(46,204,113,0.08)',
            border: `1px solid rgba(46,204,113,0.25)`,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 18 }}>&#9733;</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: L.green }}>
              Winner: {winner.name}
            </div>
            <div style={{ fontSize: 12, color: L.textDim, marginTop: 2 }}>
              {savings}% cheaper per session (${winner.costPerSession.toFixed(2)} vs $
              {loser.costPerSession.toFixed(2)})
            </div>
          </div>
        </div>
      </div>

      {/* Config Diff */}
      <div
        style={{
          background: L.surface,
          border: `1px solid ${L.border}`,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>Config Diff</SectionTitle>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12,
            fontFamily: he.mono,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Key</th>
              <th style={{ ...thStyle, color: L.accent }}>{harnessA.name} (A)</th>
              <th style={{ ...thStyle, color: L.purple }}>{harnessB.name} (B)</th>
              <th style={{ ...thStyle, width: 40 }}>Diff</th>
            </tr>
          </thead>
          <tbody>
            {configKeys.map((key) => {
              const valA = harnessA.config[key] ?? '-';
              const valB = harnessB.config[key] ?? '-';
              const same = valA === valB;
              const addedInB = valA === '-';
              const removedInB = valB === '-';
              let indicator = '~';
              let indicatorColor = L.orange;
              if (same) {
                indicator = '=';
                indicatorColor = L.textDim;
              } else if (addedInB) {
                indicator = '+';
                indicatorColor = L.green;
              } else if (removedInB) {
                indicator = '-';
                indicatorColor = L.red;
              }
              return (
                <tr key={key}>
                  <td style={tdStyle}>{key}</td>
                  <td style={{ ...tdStyle, color: same ? L.textDim : L.text }}>{valA}</td>
                  <td style={{ ...tdStyle, color: same ? L.textDim : L.text }}>{valB}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'center',
                      color: indicatorColor,
                      fontWeight: 700,
                    }}
                  >
                    {indicator}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: `1px solid ${L.border}`,
  color: L.textDim,
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: `1px solid ${L.border}`,
  color: L.text,
};

export default Harnesses;
