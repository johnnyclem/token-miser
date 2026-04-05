import chalk from "chalk";
import { parseSessions } from "../../analyzer/parser.js";
import { aggregate } from "../../analyzer/aggregator.js";
import { generateSuggestions } from "../../suggest/engine.js";

const EFFORT_COLORS: Record<string, string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#ef4444",
};

export async function runSuggest(): Promise<void> {
  const sessions = await parseSessions();
  const data = aggregate(sessions);
  const suggestions = generateSuggestions(data);

  console.log();
  console.log(chalk.bold.cyan("  ╔══════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("  ║   token-miser · Optimization Tips    ║"));
  console.log(chalk.bold.cyan("  ╚══════════════════════════════════════╝"));
  console.log();

  if (suggestions.length === 0) {
    console.log(chalk.green("  No optimization suggestions — your usage looks efficient!"));
    console.log();
    return;
  }

  for (const s of suggestions) {
    const effortColor = EFFORT_COLORS[s.effort] ?? "#94a3b8";
    console.log(chalk.bold.white(`  ${s.id}. ${s.title}`));
    console.log(
      `     Savings: ${chalk.green.bold(s.savings)}  ` +
      `Effort: ${chalk.hex(effortColor).bold(s.effort)}`
    );
    console.log();
    for (const line of s.description.split("\n")) {
      console.log(chalk.gray(`     ${line}`));
    }
    console.log();
    console.log(chalk.gray("  ─────────────────────────────────────"));
    console.log();
  }
}
