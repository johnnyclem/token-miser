import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { L, he } from './theme';
import { generateMockData } from './data';
import MetricCard from './components/MetricCard';
import Overview from './components/Overview';
import Breakdown from './components/Breakdown';
import Tools from './components/Tools';
import Suggestions from './components/Suggestions';
import Harnesses from './components/Harnesses';
import Sessions from './components/Sessions';

const TABS = ['Overview', 'Breakdown', 'Tools', 'Suggestions', 'Harnesses', 'Sessions'] as const;
type Tab = (typeof TABS)[number];

function getTabFromURL(): Tab {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab && TABS.includes(tab as Tab)) return tab as Tab;
  return 'Overview';
}

function setTabInURL(tab: Tab) {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', tab);
  window.history.pushState({}, '', url.toString());
}

const App: React.FC = () => {
  const data = useMemo(() => generateMockData(), []);
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromURL);

  useEffect(() => {
    const onPop = () => setActiveTab(getTabFromURL());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setTabInURL(tab);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview':
        return <Overview data={data} />;
      case 'Breakdown':
        return <Breakdown data={data} />;
      case 'Tools':
        return <Tools data={data} />;
      case 'Suggestions':
        return <Suggestions data={data} />;
      case 'Harnesses':
        return <Harnesses data={data} />;
      case 'Sessions':
        return <Sessions data={data} />;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: L.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '20px 32px',
          borderBottom: `1px solid ${L.border}`,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${L.accent}, ${L.purple})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            fontFamily: he.mono,
          }}
        >
          T
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: L.text,
              fontFamily: he.sans,
            }}
          >
            token-miser
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: L.textDim,
            fontFamily: he.mono,
          }}
        >
          {data.sessionCount} sessions
        </div>
      </header>

      {/* Tab Bar */}
      <nav
        style={{
          display: 'flex',
          gap: 4,
          padding: '0 32px',
          borderBottom: `1px solid ${L.border}`,
          overflowX: 'auto',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              padding: '12px 18px',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: he.sans,
              color: activeTab === tab ? L.accent : L.textDim,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? `2px solid ${L.accent}` : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Metric Cards */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          padding: '24px 32px 0',
          flexWrap: 'wrap',
        }}
      >
        <MetricCard
          label="Total Cost"
          value={`$${data.totalCost.toFixed(2)}`}
          subtext="across 14 days"
          trend={{ direction: 'up', good: false }}
        />
        <MetricCard
          label="Cache Hit Rate"
          value={`${(data.cacheHitRate * 100).toFixed(0)}%`}
          subtext="of input tokens cached"
          trend={{ direction: 'up', good: true }}
        />
        <MetricCard
          label="Compactions / Sess"
          value={data.compactionsPerSession.toFixed(1)}
          subtext="avg context resets"
        />
        <MetricCard
          label="Sessions"
          value={String(data.sessionCount)}
          subtext={`${data.projects.length} projects`}
        />
      </div>

      {/* Tab Content */}
      <main style={{ padding: '24px 32px', flex: 1 }}>{renderTab()}</main>

      {/* Footer */}
      <footer
        style={{
          padding: '20px 32px',
          borderTop: `1px solid ${L.border}`,
          textAlign: 'center',
          fontSize: 11,
          color: L.textDim,
          fontFamily: he.mono,
        }}
      >
        token-miser v0.1.0 / Connect to real data:{' '}
        <code style={{ color: L.accent }}>token-miser analyze aggregate --json | pbcopy</code>
      </footer>
    </div>
  );
};

export default App;
