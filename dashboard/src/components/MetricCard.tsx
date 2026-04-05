import React from 'react';
import { L, he } from '../theme';

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: { direction: 'up' | 'down'; good: boolean };
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, trend }) => {
  const trendColor = trend
    ? trend.good
      ? L.green
      : L.red
    : undefined;
  const trendArrow = trend ? (trend.direction === 'up' ? '\u2191' : '\u2193') : null;

  return (
    <div
      style={{
        background: L.surface,
        border: `1px solid ${L.border}`,
        borderRadius: 10,
        padding: '20px 24px',
        flex: '1 1 0',
        minWidth: 180,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: L.textDim,
          marginBottom: 8,
          fontFamily: he.sans,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: L.accent,
          fontFamily: he.mono,
          lineHeight: 1.1,
        }}
      >
        {value}
        {trendArrow && (
          <span
            style={{
              fontSize: 14,
              marginLeft: 8,
              color: trendColor,
              fontWeight: 600,
            }}
          >
            {trendArrow}
          </span>
        )}
      </div>
      {subtext && (
        <div
          style={{
            fontSize: 11,
            color: L.textDim,
            marginTop: 6,
            fontFamily: he.sans,
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
