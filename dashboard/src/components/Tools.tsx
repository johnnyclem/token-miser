import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { L, he, eo } from '../theme';
import { AggregateData } from '../data';
import SectionTitle from './SectionTitle';

interface ToolsProps {
  data: AggregateData;
}

const Tools: React.FC<ToolsProps> = ({ data }) => {
  const totalCalls = useMemo(() => data.tools.reduce((s, t) => s + t.calls, 0), [data.tools]);
  const totalCost = useMemo(() => data.tools.reduce((s, t) => s + t.cost, 0), [data.tools]);
  const avgCostPerCall = totalCalls > 0 ? totalCost / totalCalls : 0;
  const maxCost = useMemo(() => Math.max(...data.tools.map((t) => t.cost)), [data.tools]);

  const toolChartData = useMemo(
    () => data.tools.map((t) => ({ name: t.name, cost: t.cost })),
    [data.tools],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Overview */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div
          style={{
            background: L.surface,
            border: `1px solid ${L.border}`,
            borderRadius: 10,
            padding: '20px 24px',
            flex: '1 1 200px',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: L.textDim,
              marginBottom: 6,
            }}
          >
            Total Tool Calls
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: L.accent, fontFamily: he.mono }}>
            {totalCalls.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            background: L.surface,
            border: `1px solid ${L.border}`,
            borderRadius: 10,
            padding: '20px 24px',
            flex: '1 1 200px',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: L.textDim,
              marginBottom: 6,
            }}
          >
            Avg Cost / Call
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: L.accent, fontFamily: he.mono }}>
            ${avgCostPerCall.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Per-tool cards */}
      <div
        style={{
          background: L.surface,
          border: `1px solid ${L.border}`,
          borderRadius: 10,
          padding: 24,
        }}
      >
        <SectionTitle>Tool Breakdown</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.tools.map((tool) => {
            const barWidth = maxCost > 0 ? (tool.cost / maxCost) * 100 : 0;
            return (
              <div key={tool.name}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: L.text,
                        fontFamily: he.mono,
                        minWidth: 60,
                      }}
                    >
                      {tool.name}
                    </span>
                    <span style={{ fontSize: 11, color: L.textDim }}>
                      {tool.calls} calls
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {tool.avgTokens !== undefined && (
                      <span style={{ fontSize: 10, color: L.textDim, fontFamily: he.mono }}>
                        ~{tool.avgTokens.toLocaleString()} tok/call
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: L.accent,
                        fontFamily: he.mono,
                        minWidth: 50,
                        textAlign: 'right',
                      }}
                    >
                      ${tool.cost.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    height: 8,
                    background: L.border,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: '100%',
                      background: L.accent,
                      borderRadius: 4,
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost per Tool Chart */}
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

export default Tools;
