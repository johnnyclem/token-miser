import chalk from "chalk";
import { compare } from "../../harness/manager.js";
import type { Harness } from "../../analyzer/types.js";

function formatVal(val: string | number | undefined, fallback = "—"): string {
  if (val === undefined || val === null) return fallback;
  return String(val);
}

function diffIndicator(a: number, b: number, lowerIsBetter = true): string {
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

  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));
  printRow("", chalk.bold(a.name), chalk.bold(b.name), chalk.gray("  Diff"));
  console.log(chalk.gray("  ─────────────────────────────────────────────────────────"));

  printRow("Model", a.model, b.model);
  printRow(
    "Sessions",
    a.sessions.toString(),
    b.sessions.toString(),
    diffIndicator(a.sessions, b.sessions, false)
  );
  printRow(
    "Total Cost",
    "$" + a.totalCost.toFixed(4),
    "$" + b.totalCost.toFixed(4),
    diffIndicator(a.totalCost, b.totalCost, true)
  );
  printRow(
    "Total Tokens",
    a.totalTokens.toLocaleString(),
    b.totalTokens.toLocaleString(),
    diffIndicator(a.totalTokens, b.totalTokens, true)
  );
  printRow(
    "Cache Hit Rate",
    a.cacheHitRate.toFixed(1) + "%",
    b.cacheHitRate.toFixed(1) + "%",
    diffIndicator(a.cacheHitRate, b.cacheHitRate, false)
  );

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
