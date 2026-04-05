import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { L, he, eo } from '../theme';
import { AggregateData, Session } from '../data';
import SectionTitle from './SectionTitle';

interface SessionsProps {
  data: AggregateData;
}

const Sessions: React.FC<SessionsProps> = ({ data }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionTitle>All Sessions ({data.sessions.length})</SectionTitle>
      {data.sessions.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          expanded={expandedId === session.id}
          onToggle={() => toggleExpand(session.id)}
        />
      ))}
    </div>
  );
};

interface SessionRowProps {
  session: Session;
  expanded: boolean;
  onToggle: () => void;
}

const SessionRow: React.FC<SessionRowProps> = ({ session, expanded, onToggle }) => {
  const totalTokens = session.inputTokens + session.outputTokens;
  const modelShort = session.model.split('-').slice(0, 2).join('-');

  const toolChartData = useMemo(
    () => session.tools.map((t) => ({ name: t.name, calls: t.calls, cost: t.cost })),
    [session.tools],
  );

  const totalToolCalls = useMemo(
    () => session.tools.reduce((s, t) => s + t.calls, 0),
    [session.tools],
  );

  return (
    <div
      style={{
        background: L.surface,
        border: `1px solid ${expanded ? L.accent : L.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Summary row */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 20px',
          cursor: 'pointer',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: L.accent,
            fontFamily: he.mono,
            minWidth: 100,
          }}
        >
          {session.project}
        </span>
        <span style={{ fontSize: 11, color: L.textDim, fontFamily: he.mono, minWidth: 80 }}>
          {session.date}
        </span>
        <span style={{ fontSize: 11, color: L.textDim, minWidth: 40 }}>
          {session.duration}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: L.green,
            fontFamily: he.mono,
            minWidth: 55,
          }}
        >
          ${session.cost.toFixed(2)}
        </span>
        <span style={{ fontSize: 11, color: L.textDim, fontFamily: he.mono, minWidth: 80 }}>
          {totalTokens.toLocaleString()} tok
        </span>
        <span
          style={{
            fontSize: 10,
            color: L.textDim,
            background: L.bg,
            padding: '2px 8px',
            borderRadius: 4,
            fontFamily: he.mono,
          }}
        >
          {modelShort}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 12,
            color: L.textDim,
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          &#9660;
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${L.border}`,
            padding: 20,
          }}
        >
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
            <StatCard label="Cost" value={`$${session.cost.toFixed(2)}`} />
            <StatCard label="Tokens" value={totalTokens.toLocaleString()} />
            <StatCard label="Tool Calls" value={String(totalToolCalls)} />
            <StatCard label="Duration" value={session.duration} />
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {/* Cost by Category */}
            <div style={{ flex: '1 1 280px' }}>
              <SectionTitle>Cost by Category</SectionTitle>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={session.categories}
                    dataKey="cost"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={65}
                    strokeWidth={0}
                  >
                    {session.categories.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={eo}
                    formatter={(v: number) => [`$${v.toFixed(2)}`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tool Usage */}
            <div style={{ flex: '1 1 360px' }}>
              <SectionTitle>Tool Usage</SectionTitle>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={toolChartData} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={L.border} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: L.textDim, fontSize: 10 }}
                    stroke={L.border}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: L.text, fontSize: 10 }}
                    stroke={L.border}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={eo}
                    formatter={(v: number, name: string) => [
                      name === 'cost' ? `$${v.toFixed(2)}` : v,
                      name === 'cost' ? 'Cost' : 'Calls',
                    ]}
                  />
                  <Bar dataKey="calls" fill={L.accent} radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      background: L.bg,
      border: `1px solid ${L.border}`,
      borderRadius: 8,
      padding: '10px 16px',
      flex: '1 1 100px',
      minWidth: 100,
    }}
  >
    <div
      style={{
        fontSize: 9,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: L.textDim,
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 18, fontWeight: 700, color: L.accent, fontFamily: he.mono }}>
      {value}
    </div>
  </div>
);

export default Sessions;
