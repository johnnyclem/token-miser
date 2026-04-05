export interface SessionData {
  id: string;
  project: string;
  startedAt: string;
  duration: string;
  model: string;
  cost: number;
  tokens: number;
  cacheHitRate: number;
  tools: ToolUsage[];
  categories: CostCategory[];
}

export interface ToolUsage {
  tool_name: string;
  call_count: number;
  cost: number;
  avg_tokens: number;
  tokens: number;
  count: number;
  color: string;
}

export interface CostCategory {
  category: string;
  label: string;
  cost: number;
  color: string;
}

export interface ModelUsage {
  model: string;
  cost: number;
  messages: number;
  pct: number;
}

export interface DailyUsage {
  date: string;
  cost: number;
  tokens: number;
  cacheHit: number;
}

export interface Suggestion {
  id: number;
  title: string;
  savings: string;
  effort: string;
  description: string;
}

export interface HarnessConfig {
  model: string;
  maxThinkingTokens?: number;
  autoCompactThreshold?: number;
  cacheControl?: boolean;
  disabledMcpServers?: string[];
  claudeIgnorePatterns?: string[];
  env?: Record<string, string>;
}

export interface Harness {
  name: string;
  description: string;
  is_active: boolean;
  model: string;
  sessions: number;
  totalCost: number;
  totalTokens: number;
  cacheHitRate: number;
  config: HarnessConfig;
  savedAt: string;
}

export interface AggregateData {
  sessionsCount: number;
  totalCost: number;
  cacheHitRate: number;
  compactionsPerSession: number;
  inputPct: number;
  outputPct: number;
  costPerSession: number;
  categories: CostCategory[];
  models: ModelUsage[];
  tools: ToolUsage[];
  daily: DailyUsage[];
  suggestions: Suggestion[];
  harnesses: Harness[];
  sessions: SessionData[];
}
