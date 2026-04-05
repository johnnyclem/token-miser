import chalk from "chalk";
import type { AggregateData } from "../../analyzer/types.js";
import { parseSessions } from "../../analyzer/parser.js";
import { aggregate } from "../../analyzer/aggregator.js";
import { generateSuggestions } from "../../suggest/engine.js";

function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

function bar(pct: number, width = 20): string {
  const filled = Math.round((pct / 100) * width);
  return chalk.green("█".repeat(filled)) + chalk.gray("░".repeat(width - filled));
}

function printSummary(data: AggregateData): void {
  console.log();
  console.log(chalk.bold.cyan("  ╔══════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("  ║      token-miser · Analysis          ║"));
  console.log(chalk.bold.cyan("  ╚══════════════════════════════════════╝"));
  console.log();

  console.log(chalk.bold("  Summary"));
  console.log(chalk.gray("  ─────────────────────────────────────"));
  console.log(`  Sessions analyzed:   ${chalk.white.bold(data.sessionsCount.toString())}`);
  console.log(`  Total cost:          ${chalk.yellow.bold(formatCost(data.totalCost))}`);
  console.log(`  Avg cost/session:    ${chalk.yellow(formatCost(data.costPerSession))}`);
  console.log(`  Cache hit rate:      ${chalk.green(data.cacheHitRate.toFixed(1) + "%")}  ${bar(data.cacheHitRate)}`);
  console.log(`  Compactions/session: ${chalk.white(data.compactionsPerSession.toFixed(1))}`);
  console.log(`  Input tokens:        ${chalk.blue(data.inputPct.toFixed(1) + "%")}  Output: ${chalk.magenta(data.outputPct.toFixed(1) + "%")}`);
  console.log();
}

function printCategories(data: AggregateData): void {
  console.log(chalk.bold("  Cost by Category"));
  console.log(chalk.gray("  ─────────────────────────────────────"));

  const maxCost = Math.max(...data.categories.map((c) => c.cost), 0.0001);

  for (const cat of data.categories) {
    const pct = data.totalCost > 0 ? (cat.cost / data.totalCost) * 100 : 0;
    const barWidth = Math.round((cat.cost / maxCost) * 20);
    const catBar = chalk.hex(cat.color)("█".repeat(barWidth)) +
      chalk.gray("░".repeat(20 - barWidth));
    const label = cat.label.padEnd(20);
    console.log(`  ${label} ${formatCost(cat.cost).padStart(8)}  ${pct.toFixed(1).padStart(5)}%  ${catBar}`);
  }
  console.log();
}

function printTopTools(data: AggregateData): void {
  console.log(chalk.bold("  Top Tools by Cost"));
  console.log(chalk.gray("  ─────────────────────────────────────"));

  const topTools = data.tools.slice(0, 7);
  for (const tool of topTools) {
    const name = tool.tool_name.padEnd(15);
    const calls = `${tool.call_count} calls`.padEnd(12);
    console.log(
      `  ${chalk.hex(tool.color)("●")} ${name} ${formatCost(tool.cost).padStart(8)}  ${chalk.gray(calls)}  avg ${tool.avg_tokens} tok`
    );
  }
  console.log();
}

function printModels(data: AggregateData): void {
  if (data.models.length === 0) return;

  console.log(chalk.bold("  Model Usage"));
  console.log(chalk.gray("  ─────────────────────────────────────"));

  for (const m of data.models) {
    const name = m.model.padEnd(35);
    console.log(
      `  ${name} ${formatCost(m.cost).padStart(8)}  ${m.pct.toFixed(1).padStart(5)}% of sessions`
    );
  }
  console.log();
}

export async function runAnalyze(options: {
  json?: boolean;
  dashboard?: boolean;
}): Promise<void> {
  const sessions = await parseSessions();
  const data = aggregate(sessions);
  data.suggestions = generateSuggestions(data);

  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (options.dashboard) {
    const { startDashboardServer } = await import("../server.js");
    const open = await import("open");
    const { url } = await startDashboardServer(data);
    console.log(chalk.cyan(`  Dashboard running at ${url}`));
    console.log(chalk.gray("  Press Ctrl+C to stop.\n"));
    await open.default(url);
    // Keep process alive so the server stays up
    await new Promise(() => {});
  }

  printSummary(data);
  printCategories(data);
  printTopTools(data);
  printModels(data);
}
