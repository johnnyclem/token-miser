import chalk from "chalk";
import { save, list } from "../../harness/manager.js";
import { parseSessions } from "../../analyzer/parser.js";
import { aggregate } from "../../analyzer/aggregator.js";

export async function runHarnessSave(
  name: string,
  description?: string
): Promise<void> {
  const desc = description ?? `Harness snapshot: ${name}`;

  // Parse real session data so the harness records actual metrics
  const sessions = await parseSessions();
  const data = aggregate(sessions);
  const harness = save(name, desc, data);

  console.log();
  console.log(chalk.green.bold(`  Harness "${name}" saved successfully.`));
  console.log();
  console.log(`  Model:          ${chalk.white(harness.model)}`);
  console.log(`  Saved at:       ${chalk.gray(harness.savedAt)}`);

  if (harness.config.maxThinkingTokens !== undefined) {
    console.log(`  Max thinking:   ${chalk.white(harness.config.maxThinkingTokens.toString())}`);
  }
  if (harness.config.autoCompactThreshold !== undefined) {
    console.log(`  Auto-compact:   ${chalk.white(harness.config.autoCompactThreshold.toString())}`);
  }
  if (harness.config.claudeIgnorePatterns && harness.config.claudeIgnorePatterns.length > 0) {
    console.log(`  Ignore patterns: ${chalk.white(harness.config.claudeIgnorePatterns.length.toString())} rules`);
  }
  if (harness.config.disabledMcpServers && harness.config.disabledMcpServers.length > 0) {
    console.log(`  Disabled MCP:   ${chalk.white(harness.config.disabledMcpServers.join(", "))}`);
  }
  console.log();
}

export async function runHarnessList(): Promise<void> {
  const harnesses = list();

  console.log();
  console.log(chalk.bold.cyan("  ╔══════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("  ║     token-miser · Harnesses          ║"));
  console.log(chalk.bold.cyan("  ╚══════════════════════════════════════╝"));
  console.log();

  if (harnesses.length === 0) {
    console.log(chalk.gray("  No harnesses saved yet."));
    console.log(chalk.gray("  Run: token-miser harness save <name> [description]"));
    console.log();
    return;
  }

  for (const h of harnesses) {
    const active = h.is_active ? chalk.green(" [ACTIVE]") : "";
    console.log(chalk.bold.white(`  ${h.name}${active}`));
    console.log(chalk.gray(`  ${h.description}`));
    console.log(
      `  Model: ${chalk.white(h.model)}  ` +
      `Sessions: ${chalk.white(h.sessions.toString())}  ` +
      `Cost: ${chalk.yellow("$" + h.totalCost.toFixed(4))}  ` +
      `Cache: ${chalk.green(h.cacheHitRate.toFixed(1) + "%")}`
    );
    console.log(chalk.gray(`  Saved: ${h.savedAt}`));
    console.log();
  }
}
