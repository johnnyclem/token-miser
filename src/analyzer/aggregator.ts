import type {
  SessionData,
  AggregateData,
  CostCategory,
  ModelUsage,
  ToolUsage,
  DailyUsage,
} from "./types.js";

export function aggregate(sessions: SessionData[]): AggregateData {
  const sessionsCount = sessions.length;
  if (sessionsCount === 0) {
    return emptyAggregate();
  }

  const totalCost = sessions.reduce((sum, s) => sum + s.cost, 0);
  const costPerSession = totalCost / sessionsCount;
  const cacheHitRate =
    sessions.reduce((sum, s) => sum + s.cacheHitRate, 0) / sessionsCount;

  // Estimate compactions from session categories
  const compactionsPerSession =
    sessions.reduce((sum, s) => {
      const compactionCat = s.categories.find((c) => c.category === "compaction");
      return sum + (compactionCat && compactionCat.cost > 0 ? 1 + compactionCat.cost / 0.02 : 0);
    }, 0) / sessionsCount;

  // Token breakdown: estimate input vs output from categories
  const totalTokens = sessions.reduce((sum, s) => sum + s.tokens, 0);
  const toolResultCost = sumCategoryAcrossSessions(sessions, "tool_result");
  const assistantCost = sumCategoryAcrossSessions(sessions, "assistant_output");
  const thinkingCost = sumCategoryAcrossSessions(sessions, "thinking");
  const inputRelated = toolResultCost + sumCategoryAcrossSessions(sessions, "user_prompt") +
    sumCategoryAcrossSessions(sessions, "system");
  const outputRelated = assistantCost + thinkingCost +
    sumCategoryAcrossSessions(sessions, "tool_call");

  const totalIO = inputRelated + outputRelated;
  const inputPct = totalIO > 0 ? (inputRelated / totalIO) * 100 : 50;
  const outputPct = totalIO > 0 ? (outputRelated / totalIO) * 100 : 50;

  // Aggregate categories
  const categoryMap = new Map<string, CostCategory>();
  for (const session of sessions) {
    for (const cat of session.categories) {
      const existing = categoryMap.get(cat.category);
      if (existing) {
        existing.cost += cat.cost;
      } else {
        categoryMap.set(cat.category, { ...cat });
      }
    }
  }
  const categories = Array.from(categoryMap.values())
    .map((c) => ({ ...c, cost: Math.round(c.cost * 10000) / 10000 }))
    .sort((a, b) => b.cost - a.cost);

  // Model usage
  const modelMap = new Map<string, { cost: number; messages: number }>();
  for (const session of sessions) {
    const existing = modelMap.get(session.model) ?? { cost: 0, messages: 0 };
    existing.cost += session.cost;
    existing.messages += 1;
    modelMap.set(session.model, existing);
  }
  const models: ModelUsage[] = Array.from(modelMap.entries())
    .map(([model, data]) => ({
      model,
      cost: Math.round(data.cost * 10000) / 10000,
      messages: data.messages,
      pct: Math.round((data.messages / sessionsCount) * 10000) / 100,
    }))
    .sort((a, b) => b.cost - a.cost);

  // Tool usage aggregation
  const toolMap = new Map<string, ToolUsage>();
  for (const session of sessions) {
    for (const tool of session.tools) {
      const existing = toolMap.get(tool.tool_name);
      if (existing) {
        existing.call_count += tool.call_count;
        existing.cost += tool.cost;
        existing.tokens += tool.tokens;
        existing.count += tool.count;
      } else {
        toolMap.set(tool.tool_name, { ...tool });
      }
    }
  }
  const tools: ToolUsage[] = Array.from(toolMap.values())
    .map((t) => ({
      ...t,
      cost: Math.round(t.cost * 10000) / 10000,
      avg_tokens: t.count > 0 ? Math.round(t.tokens / t.count) : 0,
    }))
    .sort((a, b) => b.cost - a.cost);

  // Daily usage
  const dailyMap = new Map<string, DailyUsage>();
  for (const session of sessions) {
    const date = session.startedAt.slice(0, 10);
    const existing = dailyMap.get(date);
    if (existing) {
      existing.cost += session.cost;
      existing.tokens += session.tokens;
      existing.cacheHit = (existing.cacheHit + session.cacheHitRate) / 2;
    } else {
      dailyMap.set(date, {
        date,
        cost: session.cost,
        tokens: session.tokens,
        cacheHit: session.cacheHitRate,
      });
    }
  }
  const daily = Array.from(dailyMap.values())
    .map((d) => ({
      ...d,
      cost: Math.round(d.cost * 10000) / 10000,
      cacheHit: Math.round(d.cacheHit * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    sessionsCount,
    totalCost: Math.round(totalCost * 10000) / 10000,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    compactionsPerSession: Math.round(compactionsPerSession * 100) / 100,
    inputPct: Math.round(inputPct * 100) / 100,
    outputPct: Math.round(outputPct * 100) / 100,
    costPerSession: Math.round(costPerSession * 10000) / 10000,
    categories,
    models,
    tools,
    daily,
    suggestions: [], // filled by suggest engine
    harnesses: [], // filled by harness manager
    sessions,
  };
}

function sumCategoryAcrossSessions(sessions: SessionData[], category: string): number {
  return sessions.reduce((sum, s) => {
    const cat = s.categories.find((c) => c.category === category);
    return sum + (cat?.cost ?? 0);
  }, 0);
}

function emptyAggregate(): AggregateData {
  return {
    sessionsCount: 0,
    totalCost: 0,
    cacheHitRate: 0,
    compactionsPerSession: 0,
    inputPct: 50,
    outputPct: 50,
    costPerSession: 0,
    categories: [],
    models: [],
    tools: [],
    daily: [],
    suggestions: [],
    harnesses: [],
    sessions: [],
  };
}
