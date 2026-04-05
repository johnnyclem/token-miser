#!/usr/bin/env node

import { Command } from "commander";
import { runAnalyze } from "./commands/analyze.js";
import { runSuggest } from "./commands/suggest.js";
import { runHarnessSave, runHarnessList } from "./commands/harness.js";
import { runCompare } from "./commands/compare.js";

const program = new Command();

program
  .name("token-miser")
  .description("Claude Code token usage analyzer — cost breakdowns, optimization suggestions, and A/B harness testing")
  .version("0.1.0");

// analyze command
const analyzeCmd = program
  .command("analyze")
  .description("Analyze Claude Code token usage and costs")
  .option("--json", "Output raw JSON data")
  .option("--dashboard", "Open the browser dashboard")
  .action(async (options: { json?: boolean; dashboard?: boolean }) => {
    await runAnalyze(options);
  });

analyzeCmd
  .command("aggregate")
  .description("Output aggregated analysis data")
  .option("--json", "Output as JSON")
  .action(async (options: { json?: boolean }) => {
    await runAnalyze({ json: options.json ?? true });
  });

// suggest command
program
  .command("suggest")
  .description("Show optimization suggestions to reduce token costs")
  .action(async () => {
    await runSuggest();
  });

// harness command group
const harnessCmd = program
  .command("harness")
  .description("Manage configuration harness snapshots");

harnessCmd
  .command("save <name> [description]")
  .description("Save a harness snapshot of current configuration")
  .action(async (name: string, description?: string) => {
    await runHarnessSave(name, description);
  });

harnessCmd
  .command("list")
  .description("List all saved harnesses")
  .action(async () => {
    await runHarnessList();
  });

// compare command
program
  .command("compare <a> <b>")
  .description("Compare two harness snapshots side-by-side")
  .action(async (a: string, b: string) => {
    await runCompare(a, b);
  });

program.parse();
