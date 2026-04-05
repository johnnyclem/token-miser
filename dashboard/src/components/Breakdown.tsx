import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { L, he, eo } from '../theme';
import { AggregateData } from '../data';
import SectionTitle from './SectionTitle';

interface BreakdownProps {
  data: AggregateData;
}

const Breakdown: React.FC<BreakdownProps> = ({ data }) => {
  const totalCategoryCost = data.costCategories.reduce((s, c) => s + c.cost, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Cost by Category */}
      <div
        style={{
          background: L.surface,
          border: `1px solid ${L.border}`,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>Cost by Category</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={data.costCategories}
                dataKey="cost"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={85}
                strokeWidth={0}
              >
                {data.costCategories.map((c) => (
                  <Cell key={c.name} fill={c.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={eo}
                formatter={(v: number) => [`$${v.toFixed(2)}`]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, minWidth: 240 }}>
            {data.costCategories.map((c) => {
              const pct = ((c.cost / totalCategoryCost) * 100).toFixed(1);
              return (
                <div
                  key={c.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 10,
                    fontSize: 12,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: c.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ color: L.text, flex: 1 }}>{c.name}</div>
                  <div style={{ color: L.textDim, fontFamily: he.mono, minWidth: 50, textAlign: 'right' }}>
                    ${c.cost.toFixed(2)}
                  </div>
                  <div
                    style={{
                      color: L.textDim,
                      fontFamily: he.mono,
                      minWidth: 44,
                      textAlign: 'right',
                      fontSize: 10,
                    }}
                  >
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Token Breakdown */}
      <div
        style={{
          background: L.surface,
          border: `1px solid ${L.border}`,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>Token Breakdown</SectionTitle>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: L.blue, fontFamily: he.mono, fontWeight: 600 }}>
            Input {data.inputPct}%
          </div>
          <div style={{ fontSize: 13, color: L.green, fontFamily: he.mono, fontWeight: 600 }}>
            Output {data.outputPct}%
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            height: 32,
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${data.inputPct}%`,
              background: L.blue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              fontFamily: he.mono,
            }}
          >
            {data.inputPct}%
          </div>
          <div
            style={{
              width: `${data.outputPct}%`,
              background: L.green,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              fontFamily: he.mono,
            }}
          >
            {data.outputPct}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breakdown;
