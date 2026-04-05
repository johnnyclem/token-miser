export interface CostCategory {
  name: string;
  cost: number;
  color: string;
}

export interface ModelUsage {
  name: string;
  percentage: number;
  cost: number;
}

export interface ToolUsage {
  name: string;
  calls: number;
  cost: number;
  avgTokens?: number;
}

export interface Suggestion {
  title: string;
  savings: string;
  effort: 'low' | 'medium' | 'high';
  description: string;
}

export interface HarnessConfig {
  name: string;
  sessions: number;
  totalCost: number;
  costPerSession: number;
  totalTokens: number;
  cacheHitRate: number;
  config: Record<string, string>;
}

export interface Session {
  id: string;
  project: string;
  date: string;
  duration: string;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  model: string;
  toolCalls: number;
  categories: CostCategory[];
  tools: ToolUsage[];
}

export interface DailyCost {
  date: string;
  cost: number;
}

export interface AggregateData {
  totalCost: number;
  cacheHitRate: number;
  compactionsPerSession: number;
  sessionCount: number;
  inputPct: number;
  outputPct: number;
  costCategories: CostCategory[];
  models: ModelUsage[];
  tools: ToolUsage[];
  suggestions: Suggestion[];
  harnesses: HarnessConfig[];
  sessions: Session[];
  dailyCosts: DailyCost[];
  projects: string[];
}

export function generateMockData(): AggregateData {
  const projects = ['token-miser', 'api-gateway', 'design-system', 'docs-site', 'mobile-app'];

  const costCategories: CostCategory[] = [
    { name: 'Tool Results', cost: 4.82, color: '#E74C3C' },
    { name: 'Assistant Output', cost: 3.15, color: '#3498DB' },
    { name: 'Ext. Thinking', cost: 2.60, color: '#9B59B6' },
    { name: 'Tool Calls', cost: 1.44, color: '#F39C12' },
    { name: 'User Prompts', cost: 0.78, color: '#2ECC71' },
    { name: 'Compaction', cost: 0.52, color: '#E67E22' },
    { name: 'System/CLAUDE.md', cost: 0.31, color: '#1ABC9C' },
  ];

  const models: ModelUsage[] = [
    { name: 'claude-sonnet-4-20250514', percentage: 72, cost: 9.82 },
    { name: 'claude-opus-4-20250514', percentage: 23, cost: 3.10 },
    { name: 'claude-haiku-3-20240307', percentage: 5, cost: 0.70 },
  ];

  const tools: ToolUsage[] = [
    { name: 'Read', calls: 312, cost: 4.82, avgTokens: 1540 },
    { name: 'Edit', calls: 245, cost: 3.15, avgTokens: 1280 },
    { name: 'Bash', calls: 89, cost: 1.44, avgTokens: 1610 },
    { name: 'Grep', calls: 45, cost: 0.67, avgTokens: 1490 },
    { name: 'Write', calls: 38, cost: 0.52, avgTokens: 1370 },
    { name: 'Glob', calls: 31, cost: 0.28, avgTokens: 900 },
    { name: 'Agent', calls: 22, cost: 0.19, avgTokens: 860 },
  ];

  const suggestions: Suggestion[] = [
    {
      title: 'Enable prompt caching for CLAUDE.md',
      savings: '~$1.20/week',
      effort: 'low',
      description:
        'Your CLAUDE.md file is 2,400 tokens and sent every turn. Enabling cache_control on the system prompt reduces re-encoding costs by up to 90%.',
    },
    {
      title: 'Reduce Read tool token volume',
      savings: '~$0.80/week',
      effort: 'medium',
      description:
        'Read accounts for 35% of input tokens. Use targeted line ranges (offset/limit) instead of reading entire files. Consider adding a CLAUDE.md rule.',
    },
    {
      title: 'Consolidate Bash calls',
      savings: '~$0.45/week',
      effort: 'low',
      description:
        'Multiple sequential Bash calls with simple commands could be combined into single calls using && chaining, reducing round-trip overhead.',
    },
    {
      title: 'Use Glob before Grep',
      savings: '~$0.30/week',
      effort: 'low',
      description:
        'Several Grep calls search the entire codebase. Pre-filtering with Glob to narrow the file set can cut search token costs significantly.',
    },
    {
      title: 'Switch long sessions to Haiku for exploration',
      savings: '~$2.00/week',
      effort: 'high',
      description:
        'Sessions over 30 minutes often involve exploratory reading. Using claude-haiku for the exploration phase and Sonnet for edits can cut costs by 60%.',
    },
  ];

  const harnesses: HarnessConfig[] = [
    {
      name: 'baseline',
      sessions: 8,
      totalCost: 5.12,
      costPerSession: 0.64,
      totalTokens: 184200,
      cacheHitRate: 0.35,
      config: {
        model: 'claude-sonnet-4-20250514',
        'max_tokens': '16384',
        'cache_control': 'off',
        'thinking.budget_tokens': '0',
        'compaction.threshold': '80%',
      },
    },
    {
      name: 'thinking-cap',
      sessions: 8,
      totalCost: 6.40,
      costPerSession: 0.80,
      totalTokens: 210500,
      cacheHitRate: 0.38,
      config: {
        model: 'claude-sonnet-4-20250514',
        'max_tokens': '16384',
        'cache_control': 'off',
        'thinking.budget_tokens': '10240',
        'compaction.threshold': '80%',
      },
    },
    {
      name: 'optimized-v1',
      sessions: 7,
      totalCost: 2.10,
      costPerSession: 0.30,
      totalTokens: 98400,
      cacheHitRate: 0.62,
      config: {
        model: 'claude-sonnet-4-20250514',
        'max_tokens': '8192',
        'cache_control': 'on',
        'thinking.budget_tokens': '0',
        'compaction.threshold': '60%',
      },
    },
  ];

  const modelNames = models.map((m) => m.name);
  const sessions: Session[] = [];
  const baseDate = new Date('2026-03-22');

  for (let i = 0; i < 23; i++) {
    const dayOffset = Math.floor((i / 23) * 14);
    const date = new Date(baseDate);
    date.setDate(date.getDate() + dayOffset);
    const project = projects[i % projects.length];
    const cost = 0.25 + Math.random() * 1.1;
    const inputTokens = Math.floor(4000 + Math.random() * 12000);
    const outputTokens = Math.floor(1500 + Math.random() * 5000);
    const durationMin = Math.floor(5 + Math.random() * 55);
    const modelIdx = Math.random() < 0.72 ? 0 : Math.random() < 0.82 ? 1 : 2;

    sessions.push({
      id: `sess_${String(i + 1).padStart(3, '0')}`,
      project,
      date: date.toISOString().split('T')[0],
      duration: `${durationMin}m`,
      cost: Math.round(cost * 100) / 100,
      inputTokens,
      outputTokens,
      model: modelNames[modelIdx],
      toolCalls: Math.floor(10 + Math.random() * 50),
      categories: costCategories.map((c) => ({
        ...c,
        cost: Math.round(((c.cost / 13.62) * cost + (Math.random() - 0.5) * 0.03) * 100) / 100,
      })),
      tools: tools.slice(0, 3 + Math.floor(Math.random() * 4)).map((t) => ({
        ...t,
        calls: Math.floor(t.calls / 23 + Math.random() * 5),
        cost: Math.round(((t.cost / 13.62) * cost) * 100) / 100,
      })),
    });
  }

  // Generate daily costs aggregated from sessions
  const dailyCostMap: Record<string, number> = {};
  for (let d = 0; d < 14; d++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + d);
    dailyCostMap[date.toISOString().split('T')[0]] = 0;
  }
  for (const s of sessions) {
    if (dailyCostMap[s.date] !== undefined) {
      dailyCostMap[s.date] += s.cost;
    }
  }
  const dailyCosts: DailyCost[] = Object.entries(dailyCostMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, cost]) => ({ date, cost: Math.round(cost * 100) / 100 }));

  return {
    totalCost: 13.62,
    cacheHitRate: 0.42,
    compactionsPerSession: 1.8,
    sessionCount: 23,
    inputPct: 73,
    outputPct: 27,
    costCategories,
    models,
    tools,
    suggestions,
    harnesses,
    sessions,
    dailyCosts,
    projects,
  };
}
