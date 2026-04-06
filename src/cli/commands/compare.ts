import chalk from "chalk";
import { compare, attributeSessions, type HarnessMetrics, type AttributionResult } from "../../harness/manager.js";
import { parseSessions } from "../../analyzer/parser.js";
import type { Harness } from "../../analyzer/types.js";

function formatVal(val: string | number | undefined, fallback = "—"): string {
  if (val === undefined || val === null) return fallback;
  return String(val);
}

function diffIndicator(a: number, b: number, lowerIsBetter = true): string {
  if (a === 0 && b === 0) return chalk.gray(" =");
  if (a === b) return chalk.gray(" =");
  const better = lowerIsBetter ? b < a : b > a;
  const delta = ((b - a) / (a || 1)) * 100;
  const sign = delta > 0 ? "+" : "";
  const color = better ? chalk.green : chalk.red;
  return color(` ${sign}${delta.toFixed(1)}%`);
}

function printRow(
  label: string,
  valA: string,
  valB: string,
  diff = ""
): void {
  const l = label.padEnd(22);
  const a = valA.padStart(18);
  const b = valB.padStart(18);
  console.log(`  ${l}${a}  ${b}  ${diff}`);
}

function fmtDate(iso: string): string {
  return iso.slice(0, 10);
}

function fmtDateTime(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

export async function runCompare(nameA: string, nameB: string): Promise<void> {
  const result = compare(nameA, nameB);

  console.log();
  console.log(chalk.bold.cyan("  ╔══════════════════════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("  ║           token-miser · Harness Compare              ║"));
  console.log(chalk.bold.cyan("  ╚══════════════════════════════════════════════════════╝"));
  console.log();

  if (!result.a) {
    console.log(chalk.red(`  Harness "${nameA}" not found.`));
    console.log();
    return;
  }
  if (!result.b) {
    console.log(chalk.red(`  Harness "${nameB}" not found.`));
    console.log();
    return;
  }

  const a = result.a;
  const b = result.b;

  // Validate same-timestamp edge case
  if (a.savedAt === b.savedAt) {
    console.log(chalk.yellow("  ⚠ Both harnesses have the same savedAt timestamp."));
    console.log(chalk.gray("    No sessions can be attributed between identical timestamps."));
    console.log(chalk.gray("    Save harnesses at different times to enable A/B comparison."));
    console.log();
    return;
  }

  // Parse real sessions and attribute them by timestamp ranges
  const sessions = await parseSessions();
  const attribution = attributeSessions(a, b, sessions);
  const { earlier, later } = attribution;

  // Display timestamp attribution context
  console.log(chalk.bold("  Timestamp Attribution"));
  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
  console.log(
    chalk.gray(`  "${earlier.name}" saved ${fmtDateTime(earlier.savedAt)}`)
  );
  console.log(
    chalk.gray(`  "${later.name}" saved  ${fmtDateTime(later.savedAt)}`)
  );
  console.log();
  console.log(
    chalk.white(`  Before "${earlier.name}":  `) +
    chalk.gray(attribution.beforeRange.start ? `${fmtDate(attribution.beforeRange.start)} → ${fmtDate(attribution.beforeRange.end)}` : "(no start bound)") +
    chalk.white(` — ${attribution.a.sessions === attribution.b.sessions ? attribution.a.sessions : (attribution.swapped ? attribution.b.sessions : attribution.a.sessions)} session(s)`)
  );
  console.log(
    chalk.white(`  Between saves:         `) +
    chalk.gray(`${fmtDate(attribution.afterRange.start)} → ${fmtDate(attribution.afterRange.end)}`) +
    chalk.white(` — ${attribution.swapped ? attribution.a.sessions : attribution.b.sessions} session(s)`)
  );
  if (attribution.excludedCount > 0) {
    console.log(
      chalk.gray(`  After "${later.name}":   ${attribution.excludedCount} session(s) excluded (future experiment)`)
    );
  }
  console.log();

  const metricsA = attribution.a;
  const metricsB = attribution.b;

  // Check for empty ranges
  if (metricsA.sessions === 0 && metricsB.sessions === 0) {
    console.log(chalk.yellow("  ⚠ No sessions found in either time window."));
    console.log(chalk.gray("    Use Claude for a few sessions with each config, then re-compare."));
    console.log();
    printConfigDiff(a, b);
    return;
  }

  if (metricsA.sessions === 0) {
    console.log(chalk.yellow(`  ⚠ No sessions found before "${a.name}" was saved.`));
    console.log(chalk.gray("    The \"before\" baseline has no data. Run sessions with the first config,"));
    console.log(chalk.gray("    then save a new harness to establish a comparison window."));
    console.log();
  }

  if (metricsB.sessions === 0) {
    console.log(chalk.yellow(`  ⚠ No sessions found between the two harness saves.`));
    console.log(chalk.gray("    Try using the new configuration for a few sessions first."));
    console.log();
  }

  // Metrics table — use live session-derived metrics
  console.log(chalk.bold("  Session Metrics"));
  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
  printRow("", chalk.bold(a.name), chalk.bold(b.name), chalk.gray("  Diff"));
  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));

  printRow("Model", a.model, b.model);
  printRow(
    "Sessions",
    metricsA.sessions.toString(),
    metricsB.sessions.toString(),
    diffIndicator(metricsA.sessions, metricsB.sessions, false)
  );
  printRow(
    "Total Cost",
    "$" + metricsA.totalCost.toFixed(4),
    "$" + metricsB.totalCost.toFixed(4),
    diffIndicator(metricsA.totalCost, metricsB.totalCost, true)
  );
  printRow(
    "Cost / Session",
    "$" + metricsA.costPerSession.toFixed(4),
    "$" + metricsB.costPerSession.toFixed(4),
    diffIndicator(metricsA.costPerSession, metricsB.costPerSession, true)
  );
  printRow(
    "Total Tokens",
    metricsA.totalTokens.toLocaleString(),
    metricsB.totalTokens.toLocaleString(),
    diffIndicator(metricsA.totalTokens, metricsB.totalTokens, true)
  );
  printRow(
    "Cache Hit Rate",
    metricsA.cacheHitRate.toFixed(1) + "%",
    metricsB.cacheHitRate.toFixed(1) + "%",
    diffIndicator(metricsA.cacheHitRate, metricsB.cacheHitRate, false)
  );

  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
  console.log();

  // Per-category cost breakdown if both sides have data
  if (metricsA.sessions > 0 && metricsB.sessions > 0) {
    const allCats = new Set([
      ...Object.keys(metricsA.categories),
      ...Object.keys(metricsB.categories),
    ]);

    if (allCats.size > 0) {
      const categoryLabels: Record<string, string> = {
        tool_result: "Tool Results",
        assistant_output: "Assistant Output",
        thinking: "Ext. Thinking",
        tool_call: "Tool Calls",
        user_prompt: "User Prompts",
        compaction: "Compaction",
        system: "System / CLAUDE.md",
      };

      console.log(chalk.bold("  Cost by Category (per session)"));
      console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
      printRow("", chalk.bold(a.name), chalk.bold(b.name), chalk.gray("  Diff"));
      console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));

      for (const cat of allCats) {
        const costA = (metricsA.categories[cat] ?? 0) / metricsA.sessions;
        const costB = (metricsB.categories[cat] ?? 0) / metricsB.sessions;
        const label = categoryLabels[cat] ?? cat;
        printRow(
          label,
          "$" + costA.toFixed(4),
          "$" + costB.toFixed(4),
          diffIndicator(costA, costB, true)
        );
      }

      console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
      console.log();
    }

    // Top tools comparison
    const allTools = new Set([
      ...Object.keys(metricsA.tools),
      ...Object.keys(metricsB.tools),
    ]);

    if (allTools.size > 0) {
      // Show top 5 tools by combined cost
      const toolCosts = Array.from(allTools).map((name) => ({
        name,
        totalCost: (metricsA.tools[name]?.cost ?? 0) + (metricsB.tools[name]?.cost ?? 0),
      }));
      toolCosts.sort((a, b) => b.totalCost - a.totalCost);
      const topTools = toolCosts.slice(0, 5);

      console.log(chalk.bold("  Top Tools (per session cost)"));
      console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
      printRow("", chalk.bold(a.name), chalk.bold(b.name), chalk.gray("  Diff"));
      console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));

      for (const { name } of topTools) {
        const costA = (metricsA.tools[name]?.cost ?? 0) / metricsA.sessions;
        const costB = (metricsB.tools[name]?.cost ?? 0) / metricsB.sessions;
        printRow(
          name,
          "$" + costA.toFixed(4),
          "$" + costB.toFixed(4),
          diffIndicator(costA, costB, true)
        );
      }

      console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
      console.log();
    }
  }

  // Bottom-line verdict
  if (metricsA.sessions > 0 && metricsB.sessions > 0 && metricsA.costPerSession > 0) {
    const savingsPct = ((metricsA.costPerSession - metricsB.costPerSession) / metricsA.costPerSession) * 100;
    if (savingsPct > 0) {
      console.log(chalk.green.bold(`  ✓ ${b.name} saves ${savingsPct.toFixed(1)}% per session vs ${a.name}`));
    } else if (savingsPct < 0) {
      console.log(chalk.red.bold(`  ✗ ${b.name} costs ${Math.abs(savingsPct).toFixed(1)}% more per session vs ${a.name}`));
    } else {
      console.log(chalk.gray(`  = No cost difference per session`));
    }
    console.log(
      chalk.gray(`    Based on ${metricsA.sessions} session(s) before vs ${metricsB.sessions} session(s) after`)
    );
    console.log();
  } else if (metricsA.sessions === 0 || metricsB.sessions === 0) {
    console.log(chalk.yellow("  ⚠ Not enough sessions in both windows to compare."));
    console.log(chalk.gray("    Run 5+ sessions with each config, then re-compare."));
    console.log();
  }

  // Config comparison
  printConfigDiff(a, b);
}

function printConfigDiff(a: Harness, b: Harness): void {
  console.log(chalk.bold("  Configuration Differences"));
  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));

  printRow(
    "Max Thinking",
    formatVal(a.config.maxThinkingTokens),
    formatVal(b.config.maxThinkingTokens)
  );
  printRow(
    "Auto-Compact",
    formatVal(a.config.autoCompactThreshold),
    formatVal(b.config.autoCompactThreshold)
  );
  printRow(
    "Cache Control",
    formatVal(a.config.cacheControl !== undefined ? String(a.config.cacheControl) : undefined),
    formatVal(b.config.cacheControl !== undefined ? String(b.config.cacheControl) : undefined)
  );
  printRow(
    "Ignore Patterns",
    (a.config.claudeIgnorePatterns?.length ?? 0).toString() + " rules",
    (b.config.claudeIgnorePatterns?.length ?? 0).toString() + " rules"
  );
  printRow(
    "Disabled MCP",
    (a.config.disabledMcpServers?.length ?? 0).toString() + " servers",
    (b.config.disabledMcpServers?.length ?? 0).toString() + " servers"
  );

  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
  console.log();
}
