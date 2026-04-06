import chalk from "chalk";
import { save, list } from "../../harness/manager.js";

export async function runHarnessSave(
  name: string,
  description?: string
): Promise<void> {
  const desc = description ?? `Harness snapshot: ${name}`;
  const harness = save(name, desc);

  console.log();
  console.log(chalk.green.bold(`  Harness "${name}" saved successfully.`));
  console.log();
  console.log(`  Model:          ${chalk.white(harness.model)}`);
  console.log(`  Saved at:       ${chalk.white(harness.savedAt.slice(0, 16).replace("T", " "))}`);

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
  console.log(chalk.gray("  Next: Use Claude for several sessions, then save another harness"));
  console.log(chalk.gray("  and run: token-miser compare " + name + " <next-harness>"));
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

  for (let i = 0; i < harnesses.length; i++) {
    const h = harnesses[i];
    const active = h.is_active ? chalk.green(" [ACTIVE]") : "";
    const dateStr = h.savedAt.slice(0, 16).replace("T", " ");
    console.log(chalk.bold.white(`  ${h.name}${active}`) + chalk.gray(`  (${dateStr})`));
    console.log(chalk.gray(`    ${h.description}`));
    console.log(
      `    Model: ${chalk.white(h.model)}  ` +
      `Cache: ${chalk.green(h.config.cacheControl !== undefined ? String(h.config.cacheControl) : "—")}  ` +
      `Ignore: ${chalk.white((h.config.claudeIgnorePatterns?.length ?? 0).toString())} rules`
    );

    // Show time range context between consecutive harnesses
    if (i < harnesses.length - 1) {
      const next = harnesses[i + 1]; // sorted newest first, so next is older
      console.log(
        chalk.gray(`    ↕ compare window: ${next.savedAt.slice(0, 10)} → ${h.savedAt.slice(0, 10)}`)
      );
    }

    console.log();
  }

  if (harnesses.length >= 2) {
    const newest = harnesses[0];
    const oldest = harnesses[harnesses.length - 1];
    console.log(chalk.gray(`  Compare: token-miser compare ${oldest.name} ${newest.name}`));
    console.log();
  }
}
