import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { L, he, eo } from '../theme';
import { AggregateData } from '../data';
import SectionTitle from './SectionTitle';

interface OverviewProps {
  data: AggregateData;
}

const MODEL_COLORS = [L.accent, L.purple, L.teal];

const Overview: React.FC<OverviewProps> = ({ data }) => {
  const toolChartData = data.tools.map((t) => ({
    name: t.name,
    cost: t.cost,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Cost Trend */}
      <div
        style={{
          background: L.surface,
          border: `1px solid ${L.border}`,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>Cost Trend (14 days)</SectionTitle>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.dailyCosts}>
            <defs>
              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={L.accent} stopOpacity={0.3} />
                <stop offset="100%" stopColor={L.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={L.border} />
            <XAxis
              dataKey="date"
              tick={{ fill: L.textDim, fontSize: 10 }}
              tickFormatter={(v: string) => v.slice(5)}
              stroke={L.border}
            />
            <YAxis
              tick={{ fill: L.textDim, fontSize: 10 }}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
              stroke={L.border}
              width={52}
            />
            <Tooltip
              contentStyle={eo}
              labelStyle={{ color: L.textDim }}
              formatter={(v: number) => [`$${v.toFixed(2)}`, 'Cost']}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke={L.accent}
              strokeWidth={2}
              fill="url(#costGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Token Flow + Model Usage */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Token Flow */}
        <div
          style={{
            background: L.surface,
            border: `1px solid ${L.border}`,
            borderRadius: 10,
            padding: 24,
            flex: '1 1 360px',
          }}
        >
          <SectionTitle>Token Flow</SectionTitle>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: L.blue,
                  fontFamily: he.mono,
                }}
              >
                {data.inputPct}%
              </div>
              <div style={{ fontSize: 11, color: L.textDim, marginTop: 4 }}>Input</div>
            </div>
            <div
              style={{
                fontSize: 20,
                color: L.textDim,
                fontWeight: 300,
              }}
            >
              /
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: L.green,
                  fontFamily: he.mono,
                }}
              >
                {data.outputPct}%
              </div>
              <div style={{ fontSize: 11, color: L.textDim, marginTop: 4 }}>Output</div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              height: 24,
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${data.inputPct}%`,
                background: L.blue,
                transition: 'width 0.3s',
              }}
            />
            <div
              style={{
                width: `${data.outputPct}%`,
                background: L.green,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        {/* Model Usage */}
        <div
          style={{
            background: L.surface,
            border: `1px solid ${L.border}`,
            borderRadius: 10,
            padding: 24,
            flex: '1 1 360px',
          }}
        >
          <SectionTitle>Model Usage</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={data.models}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={62}
                  strokeWidth={0}
                >
                  {data.models.map((_, i) => (
                    <Cell key={i} fill={MODEL_COLORS[i % MODEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={eo}
                  formatter={(v: number) => [`${v}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {data.models.map((m, i) => (
                <div
                  key={m.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    fontSize: 11,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: MODEL_COLORS[i],
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ color: L.text, flex: 1 }}>
                    {m.name.split('-').slice(0, 2).join('-')}
                  </div>
                  <div style={{ color: L.textDim, fontFamily: he.mono }}>
                    {m.percentage}% &middot; ${m.cost.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cost per Tool */}
      <div
        style={{
          background: L.surface,
          border: `1px solid ${L.border}`,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>Cost per Tool</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={toolChartData} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={L.border} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: L.textDim, fontSize: 10 }}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
              stroke={L.border}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: L.text, fontSize: 11 }}
              stroke={L.border}
              width={50}
            />
            <Tooltip
              contentStyle={eo}
              formatter={(v: number) => [`$${v.toFixed(2)}`, 'Cost']}
            />
            <Bar dataKey="cost" fill={L.accent} radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Overview;
