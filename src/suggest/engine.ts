import type { AggregateData, Suggestion } from "../analyzer/types.js";

export function generateSuggestions(data: AggregateData): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let nextId = 1;

  // 1. Add .claudeignore patterns - if tool results cost is high
  const toolResultCat = data.categories.find((c) => c.category === "tool_result");
  const toolResultPct =
    toolResultCat && data.totalCost > 0
      ? (toolResultCat.cost / data.totalCost) * 100
      : 0;

  if (toolResultPct > 20 || data.totalCost === 0) {
    suggestions.push({
      id: nextId++,
      title: "Add .claudeignore patterns",
      savings: "15-25%",
      effort: "Low",
      description:
        "Tool results account for a large share of your token spend. " +
        "Create a .claudeignore file to exclude build artifacts, node_modules, " +
        "dist/, coverage/, and large generated files. This reduces tokens sent " +
        "with every Read and Grep result. Example patterns:\n" +
        "  node_modules/\n  dist/\n  *.min.js\n  coverage/\n  .git/",
    });
  }

  // 2. Enable prompt caching - if cache hit rate is low
  if (data.cacheHitRate < 50) {
    suggestions.push({
      id: nextId++,
      title: "Enable prompt caching",
      savings: "20-40%",
      effort: "Low",
      description:
        `Your cache hit rate is ${data.cacheHitRate.toFixed(1)}%, which is below the 50% target. ` +
        "Prompt caching can dramatically reduce input token costs by reusing " +
        "previously processed context. Ensure your CLAUDE.md and system prompts " +
        "are stable (changes invalidate the cache). Avoid unnecessary context " +
        "switching between projects within the same session.",
    });
  }

  // 3. Set thinking token cap - if ext thinking cost is high
  const thinkingCat = data.categories.find((c) => c.category === "thinking");
  const thinkingPct =
    thinkingCat && data.totalCost > 0
      ? (thinkingCat.cost / data.totalCost) * 100
      : 0;

  if (thinkingPct > 15 || data.totalCost === 0) {
    suggestions.push({
      id: nextId++,
      title: "Set thinking token cap",
      savings: "10-20%",
      effort: "Medium",
      description:
        "Extended thinking is consuming a significant portion of your budget. " +
        "Set maxThinkingTokens in your settings to limit thinking output. " +
        "For most coding tasks, 10,000-20,000 thinking tokens is sufficient. " +
        "Add to .claude/settings.json:\n" +
        '  { "maxThinkingTokens": 15000 }',
    });
  }

  // 4. Use auto-compact earlier - if many compactions per session
  if (data.compactionsPerSession > 2 || data.totalCost === 0) {
    suggestions.push({
      id: nextId++,
      title: "Use auto-compact earlier",
      savings: "5-15%",
      effort: "Low",
      description:
        `You average ${data.compactionsPerSession.toFixed(1)} compactions per session. ` +
        "Each compaction re-processes the full context. Set a lower auto-compact " +
        "threshold to compact sooner and avoid expensive late-session compactions. " +
        "Add to .claude/settings.json:\n" +
        '  { "autoCompactThreshold": 60000 }',
    });
  }

  // 5. Disable unused MCP servers - always suggest if there are sessions
  if (data.sessionsCount > 0) {
    suggestions.push({
      id: nextId++,
      title: "Disable unused MCP servers",
      savings: "5-10%",
      effort: "Low",
      description:
        "Each enabled MCP server adds tool definitions to every request, " +
        "increasing input tokens. Review your MCP server list and disable " +
        "any servers you rarely use. Check .claude/settings.json for " +
        "mcpServers entries. You can also set disabledMcpServers to " +
        "selectively turn off servers without removing their configuration.",
    });
  }

  return suggestions;
}
