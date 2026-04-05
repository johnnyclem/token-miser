import chalk from "chalk";
import { compare, attributeSessions, type HarnessMetrics } from "../../harness/manager.js";
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

  // Parse real sessions and attribute them by timestamp ranges
  const sessions = await parseSessions();
  const metrics = attributeSessions(a, b, sessions);

  // Determine chronological order for display
  const aFirst = new Date(a.savedAt).getTime() <= new Date(b.savedAt).getTime();
  const earlierLabel = aFirst ? a.name : b.name;
  const laterLabel = aFirst ? b.name : a.name;

  console.log(chalk.gray(`  Sessions attributed by timestamp:`));
  console.log(chalk.gray(`    ${earlierLabel} (saved ${(aFirst ? a : b).savedAt.slice(0, 10)}) → ${metrics.a.sessions > metrics.b.sessions ? metrics.a.sessions : metrics.b.sessions} sessions before`));
  console.log(chalk.gray(`    ${laterLabel} (saved ${(aFirst ? b : a).savedAt.slice(0, 10)}) → ${aFirst ? metrics.b.sessions : metrics.a.sessions} sessions after`));
  console.log();

  // Metrics table — use live session-derived metrics
  console.log(chalk.bold("  Session Metrics (live)"));
  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
  printRow("", chalk.bold(a.name), chalk.bold(b.name), chalk.gray("  Diff"));
  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));

  printRow("Model", a.model, b.model);
  printRow(
    "Sessions",
    metrics.a.sessions.toString(),
    metrics.b.sessions.toString(),
    diffIndicator(metrics.a.sessions, metrics.b.sessions, false)
  );
  printRow(
    "Total Cost",
    "$" + metrics.a.totalCost.toFixed(4),
    "$" + metrics.b.totalCost.toFixed(4),
    diffIndicator(metrics.a.totalCost, metrics.b.totalCost, true)
  );
  printRow(
    "Cost / Session",
    "$" + metrics.a.costPerSession.toFixed(4),
    "$" + metrics.b.costPerSession.toFixed(4),
    diffIndicator(metrics.a.costPerSession, metrics.b.costPerSession, true)
  );
  printRow(
    "Total Tokens",
    metrics.a.totalTokens.toLocaleString(),
    metrics.b.totalTokens.toLocaleString(),
    diffIndicator(metrics.a.totalTokens, metrics.b.totalTokens, true)
  );
  printRow(
    "Cache Hit Rate",
    metrics.a.cacheHitRate.toFixed(1) + "%",
    metrics.b.cacheHitRate.toFixed(1) + "%",
    diffIndicator(metrics.a.cacheHitRate, metrics.b.cacheHitRate, false)
  );

  // Bottom-line verdict
  if (metrics.a.sessions > 0 && metrics.b.sessions > 0 && metrics.a.costPerSession > 0) {
    const savingsPct = ((metrics.a.costPerSession - metrics.b.costPerSession) / metrics.a.costPerSession) * 100;
    console.log();
    if (savingsPct > 0) {
      console.log(chalk.green.bold(`  ✓ ${b.name} saves ${savingsPct.toFixed(1)}% per session vs ${a.name}`));
    } else if (savingsPct < 0) {
      console.log(chalk.red.bold(`  ✗ ${b.name} costs ${Math.abs(savingsPct).toFixed(1)}% more per session vs ${a.name}`));
    } else {
      console.log(chalk.gray(`  = No cost difference per session`));
    }
  } else if (metrics.a.sessions === 0 || metrics.b.sessions === 0) {
    console.log();
    console.log(chalk.yellow("  ⚠ Not enough sessions to compare."));
    console.log(chalk.gray("    Run 5+ sessions with each config, then re-compare."));
  }

  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
  console.log();

  // Config comparison
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
