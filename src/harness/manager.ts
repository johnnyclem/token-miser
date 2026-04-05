import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { Harness, HarnessConfig } from "../analyzer/types.js";

const HARNESS_DIR = join(process.cwd(), ".token-miser", "harnesses");

function ensureDir(): void {
  if (!existsSync(HARNESS_DIR)) {
    mkdirSync(HARNESS_DIR, { recursive: true });
  }
}

function readOptionalFile(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function readCurrentConfig(): HarnessConfig {
  const settingsPath = join(homedir(), ".claude", "settings.json");
  const claudeIgnorePath = join(process.cwd(), ".claudeignore");

  let settings: Record<string, unknown> = {};
  const rawSettings = readOptionalFile(settingsPath);
  if (rawSettings) {
    try {
      settings = JSON.parse(rawSettings) as Record<string, unknown>;
    } catch {
      // use defaults
    }
  }

  const claudeIgnore = readOptionalFile(claudeIgnorePath);
  const patterns = claudeIgnore
    ? claudeIgnore.split("\n").filter((l) => l.trim() && !l.startsWith("#"))
    : [];

  return {
    model: (settings.model as string) ?? "claude-sonnet-4-20250514",
    maxThinkingTokens: settings.maxThinkingTokens as number | undefined,
    autoCompactThreshold: settings.autoCompactThreshold as number | undefined,
    cacheControl: settings.cacheControl as boolean | undefined,
    disabledMcpServers: settings.disabledMcpServers as string[] | undefined,
    claudeIgnorePatterns: patterns.length > 0 ? patterns : undefined,
    env: settings.env as Record<string, string> | undefined,
  };
}

export function save(name: string, description: string): Harness {
  ensureDir();
  const config = readCurrentConfig();

  const harness: Harness = {
    name,
    description,
    is_active: false,
    model: config.model,
    sessions: 0,
    totalCost: 0,
    totalTokens: 0,
    cacheHitRate: 0,
    config,
    savedAt: new Date().toISOString(),
  };

  const filePath = join(HARNESS_DIR, `${name}.json`);
  writeFileSync(filePath, JSON.stringify(harness, null, 2), "utf-8");

  // Also snapshot CLAUDE.md if it exists
  const claudeMdPath = join(process.cwd(), "CLAUDE.md");
  const claudeMd = readOptionalFile(claudeMdPath);
  if (claudeMd !== null) {
    writeFileSync(
      join(HARNESS_DIR, `${name}.CLAUDE.md`),
      claudeMd,
      "utf-8"
    );
  }

  return harness;
}

export function list(): Harness[] {
  ensureDir();
  const files = readdirSync(HARNESS_DIR).filter((f) => f.endsWith(".json"));
  const harnesses: Harness[] = [];

  for (const file of files) {
    try {
      const content = readFileSync(join(HARNESS_DIR, file), "utf-8");
      harnesses.push(JSON.parse(content) as Harness);
    } catch {
      // skip corrupt files
    }
  }

  return harnesses.sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}

export function load(name: string): Harness | null {
  const filePath = join(HARNESS_DIR, `${name}.json`);
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content) as Harness;
  } catch {
    return null;
  }
}

export function compare(
  nameA: string,
  nameB: string
): { a: Harness | null; b: Harness | null } {
  return {
    a: load(nameA),
    b: load(nameB),
  };
}
