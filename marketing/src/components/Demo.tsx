import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { oe, Ue } from '../theme';
import { useReveal } from '../hooks';

const costCategories = [
  { name: 'Tool Results', cost: 4.82, color: '#E74C3C' },
  { name: 'Assistant Output', cost: 3.15, color: '#3498DB' },
  { name: 'Ext. Thinking', cost: 2.60, color: '#9B59B6' },
  { name: 'Tool Calls', cost: 1.44, color: '#F39C12' },
  { name: 'User Prompts', cost: 0.78, color: '#2ECC71' },
  { name: 'Compaction', cost: 0.52, color: '#E67E22' },
  { name: 'System/CLAUDE.md', cost: 0.31, color: '#1ABC9C' },
];

const dailyCosts = [
  { date: 'Mon', cost: 2.10 },
  { date: 'Tue', cost: 1.85 },
  { date: 'Wed', cost: 2.40 },
  { date: 'Thu', cost: 1.60 },
  { date: 'Fri', cost: 2.95 },
  { date: 'Sat', cost: 0.82 },
  { date: 'Sun', cost: 1.90 },
];

const tooltipStyle = {
  background: oe.bg,
  border: `1px solid ${oe.border}`,
  borderRadius: 6,
  fontSize: 11,
  fontFamily: Ue.mono,
};

const MetricMini: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div
    style={{
      flex: '1 1 140px',
      background: oe.surface,
      border: `1px solid ${oe.border}`,
      borderRadius: 10,
      padding: '16px 20px',
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: 11, color: oe.textDim, fontFamily: Ue.sans, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
      {label}
    </div>
    <div style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, color, fontFamily: Ue.mono }}>
      {value}
    </div>
  </div>
);

const Demo: React.FC = () => {
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
        See it in action
      </h2>
      <p
        style={{
          fontSize: 'clamp(14px, 1.4vw, 16px)',
          color: oe.textDim,
          fontFamily: Ue.sans,
          textAlign: 'center',
          marginBottom: 40,
          lineHeight: 1.5,
        }}
      >
        Run{' '}
        <code style={{ color: oe.accent, fontFamily: Ue.mono }}>token-miser analyze --dashboard</code>{' '}
        to open an interactive dashboard in your browser.
      </p>

      {/* Mock dashboard */}
      <div
        style={{
          background: oe.surface,
          border: `1px solid ${oe.border}`,
          borderRadius: 14,
          padding: 'clamp(20px, 3vw, 32px)',
          overflow: 'hidden',
        }}
      >
        {/* Metric cards row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <MetricMini label="Total Cost" value="$13.62" color={oe.text} />
          <MetricMini label="Cache Hit" value="42%" color={oe.green} />
          <MetricMini label="Sessions" value="23" color={oe.accent} />
        </div>

        {/* Charts row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
          {/* Pie chart */}
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: oe.text, fontFamily: Ue.sans, marginBottom: 12 }}>
              Cost by Category
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={costCategories}
                  dataKey="cost"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  strokeWidth={0}
                >
                  {costCategories.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8 }}>
              {costCategories.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                  <span style={{ fontSize: 11, color: oe.textDim, fontFamily: Ue.sans }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: oe.text, fontFamily: Ue.sans, marginBottom: 12 }}>
              Daily Cost Trend
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyCosts}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: oe.textDim, fontSize: 11, fontFamily: Ue.mono }}
                  axisLine={{ stroke: oe.border }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: oe.textDim, fontSize: 11, fontFamily: Ue.mono }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                />
                <Bar dataKey="cost" fill={oe.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
