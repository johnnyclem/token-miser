import type { AggregateData, Suggestion } from "../analyzer/types.js";

/** Format a dollar amount for display, e.g. "$1.24" or "$0.08" */
function fmtDollars(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Estimate weekly savings as a fraction of the relevant category cost,
 * scaled to a 7-day window from the data we have.
 */
function weeklyEstimate(categoryCost: number, savingsPct: number, data: AggregateData): string {
  const days = dataDaySpan(data);
  if (days <= 0 || categoryCost <= 0) return "—";
  const dailyCost = categoryCost / days;
  const weeklySavings = dailyCost * 7 * savingsPct;
  return `~${fmtDollars(weeklySavings)}/week`;
}

function dataDaySpan(data: AggregateData): number {
  if (data.daily.length < 2) return data.daily.length;
  const first = new Date(data.daily[0].date).getTime();
  const last = new Date(data.daily[data.daily.length - 1].date).getTime();
  return Math.max(1, Math.round((last - first) / 86_400_000) + 1);
}

export function generateSuggestions(data: AggregateData): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let nextId = 1;

  // 1. Add .claudeignore patterns — if tool results cost is high
  const toolResultCat = data.categories.find((c) => c.category === "tool_result");
  const toolResultCost = toolResultCat?.cost ?? 0;
  const toolResultPct =
    toolResultCat && data.totalCost > 0
      ? (toolResultCat.cost / data.totalCost) * 100
      : 0;

  if (toolResultPct > 20) {
    const est = weeklyEstimate(toolResultCost, 0.20, data);
    suggestions.push({
      id: nextId++,
      title: "Add .claudeignore patterns",
      savings: est,
      effort: "Low",
      description:
        `Tool results are ${toolResultPct.toFixed(0)}% of your spend (${fmtDollars(toolResultCost)} total). ` +
        "Create a .claudeignore file to exclude build artifacts, node_modules, " +
        "dist/, coverage/, and large generated files. This reduces tokens sent " +
        "with every Read and Grep result. Example patterns:\n" +
        "  node_modules/\n  dist/\n  *.min.js\n  coverage/\n  .git/",
    });
  }

  // 2. Enable prompt caching — if cache hit rate is low
  if (data.cacheHitRate < 50 && data.sessionsCount > 0) {
    // Estimate: improving cache from current rate to ~70% saves roughly
    // (70 - current)% of input token cost
    const inputCost = data.categories
      .filter((c) => ["tool_result", "user_prompt", "system"].includes(c.category))
      .reduce((sum, c) => sum + c.cost, 0);
    const improvementPct = (70 - data.cacheHitRate) / 100;
    const est = weeklyEstimate(inputCost, improvementPct * 0.9, data);
    suggestions.push({
      id: nextId++,
      title: "Improve prompt caching",
      savings: est,
      effort: "Low",
      description:
        `Your cache hit rate is ${data.cacheHitRate.toFixed(1)}%, well below the 70% target. ` +
        `Input-side costs total ${fmtDollars(inputCost)}. ` +
        "Ensure your CLAUDE.md and system prompts are stable (changes invalidate the cache). " +
        "Avoid unnecessary context switching between projects within the same session.",
    });
  }

  // 3. Set thinking token cap — if ext thinking cost is high
  const thinkingCat = data.categories.find((c) => c.category === "thinking");
  const thinkingCost = thinkingCat?.cost ?? 0;
  const thinkingPct =
    thinkingCat && data.totalCost > 0
      ? (thinkingCat.cost / data.totalCost) * 100
      : 0;

  if (thinkingPct > 15) {
    const est = weeklyEstimate(thinkingCost, 0.35, data);
    suggestions.push({
      id: nextId++,
      title: "Set thinking token cap",
      savings: est,
      effort: "Medium",
      description:
        `Extended thinking is ${thinkingPct.toFixed(0)}% of your budget (${fmtDollars(thinkingCost)}). ` +
        "For most coding tasks, 10k-20k thinking tokens is sufficient. " +
        "Add to .claude/settings.json:\n" +
        '  { "maxThinkingTokens": 15000 }',
    });
  }

  // 4. Use auto-compact earlier — if many compactions per session
  if (data.compactionsPerSession > 2) {
    const compactionCat = data.categories.find((c) => c.category === "compaction");
    const compactionCost = compactionCat?.cost ?? 0;
    const est = weeklyEstimate(compactionCost, 0.40, data);
    suggestions.push({
      id: nextId++,
      title: "Use auto-compact earlier",
      savings: est,
      effort: "Low",
      description:
        `You average ${data.compactionsPerSession.toFixed(1)} compactions/session ` +
        `(${fmtDollars(compactionCost)} total compaction cost). ` +
        "Each compaction re-processes the full context. Set a lower threshold " +
        "to compact sooner:\n" +
        '  { "autoCompactThreshold": 60000 }',
    });
  }

  // 5. Reduce Read tool volume — if Read is the costliest tool
  const readTool = data.tools.find((t) => t.tool_name === "Read");
  if (readTool && data.tools.length > 0 && readTool.cost === data.tools[0].cost) {
    const est = weeklyEstimate(readTool.cost, 0.25, data);
    suggestions.push({
      id: nextId++,
      title: "Reduce Read tool token volume",
      savings: est,
      effort: "Medium",
      description:
        `Read is your costliest tool at ${fmtDollars(readTool.cost)} across ${readTool.call_count} calls ` +
        `(avg ${readTool.avg_tokens} tokens/call). ` +
        "Use targeted line ranges (offset/limit) instead of reading entire files. " +
        "Add a CLAUDE.md instruction like: \"When reading files, prefer specific line ranges.\"",
    });
  }

  // 6. Disable unused MCP servers — always suggest if there are sessions
  if (data.sessionsCount > 0) {
    suggestions.push({
      id: nextId++,
      title: "Audit MCP server list",
      savings: "~5-10% of input costs",
      effort: "Low",
      description:
        "Each enabled MCP server adds tool definitions to every request. " +
        "Review .claude/settings.json mcpServers entries and disable " +
        "servers you rarely use via disabledMcpServers.",
    });
  }

  return suggestions;
}
