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

/** Metrics derived from sessions that fall within a harness's time window. */
export interface HarnessMetrics {
  sessions: number;
  totalCost: number;
  costPerSession: number;
  totalTokens: number;
  cacheHitRate: number;
  /** Per-category cost breakdown for the sessions in this window. */
  categories: Record<string, number>;
  /** Per-tool cost breakdown for the sessions in this window. */
  tools: Record<string, { count: number; cost: number; tokens: number }>;
}

export interface AttributionResult {
  a: HarnessMetrics;
  b: HarnessMetrics;
  /** The harness that was saved first (chronologically). */
  earlier: Harness;
  /** The harness that was saved second (chronologically). */
  later: Harness;
  /** Whether A and B were swapped to achieve chronological order. */
  swapped: boolean;
  /** ISO date range: [start, end) for the "before" window. */
  beforeRange: { start: string | null; end: string };
  /** ISO date range: [start, end) for the "after" window. */
  afterRange: { start: string; end: string };
  /** Sessions that fell outside both windows (after the later harness). */
  excludedCount: number;
}

export type SessionLike = {
  startedAt: string;
  cost: number;
  tokens: number;
  cacheHitRate: number;
  categories?: Array<{ category: string; cost: number }>;
  tools?: Array<{ tool_name: string; count: number; cost: number; tokens: number }>;
};

/**
 * Given two harnesses (ordered by savedAt) and all available sessions,
 * attribute sessions to each harness by timestamp range:
 *
 *   Harness A owns: sessions with startedAt < A.savedAt
 *   Harness B owns: sessions with A.savedAt <= startedAt < B.savedAt
 *
 * If A is saved *after* B, the tool swaps them automatically so the
 * earlier harness is always "before" and the later is "after."
 *
 * Returns full attribution metadata including per-category and per-tool
 * breakdowns for each period.
 */
export function attributeSessions(
  harnessA: Harness,
  harnessB: Harness,
  sessions: SessionLike[]
): AttributionResult {
  const aTime = new Date(harnessA.savedAt).getTime();
  const bTime = new Date(harnessB.savedAt).getTime();

  // Ensure chronological order: earlier harness is "before"
  const swapped = aTime > bTime;
  const [earlier, later] = swapped ? [harnessB, harnessA] : [harnessA, harnessB];

  const cutoff = new Date(earlier.savedAt).getTime();
  const end = new Date(later.savedAt).getTime();

  const beforeSessions: SessionLike[] = [];
  const afterSessions: SessionLike[] = [];
  let excludedCount = 0;

  for (const s of sessions) {
    const t = new Date(s.startedAt).getTime();
    if (t < cutoff) {
      beforeSessions.push(s);
    } else if (t < end) {
      afterSessions.push(s);
    } else {
      excludedCount++;
    }
  }

  function metricsFrom(list: SessionLike[]): HarnessMetrics {
    const count = list.length;
    const totalCost = list.reduce((s, x) => s + x.cost, 0);
    const totalTokens = list.reduce((s, x) => s + x.tokens, 0);
    const cacheHitRate = count > 0
      ? list.reduce((s, x) => s + x.cacheHitRate, 0) / count
      : 0;

    // Aggregate per-category costs
    const categories: Record<string, number> = {};
    for (const session of list) {
      for (const cat of session.categories ?? []) {
        categories[cat.category] = (categories[cat.category] ?? 0) + cat.cost;
      }
    }

    // Aggregate per-tool metrics
    const tools: Record<string, { count: number; cost: number; tokens: number }> = {};
    for (const session of list) {
      for (const tool of session.tools ?? []) {
        const existing = tools[tool.tool_name] ?? { count: 0, cost: 0, tokens: 0 };
        existing.count += tool.count;
        existing.cost += tool.cost;
        existing.tokens += tool.tokens;
        tools[tool.tool_name] = existing;
      }
    }

    return {
      sessions: count,
      totalCost: Math.round(totalCost * 10000) / 10000,
      costPerSession: count > 0 ? Math.round((totalCost / count) * 10000) / 10000 : 0,
      totalTokens,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      categories,
      tools,
    };
  }

  // Map back to the original A/B order (not chronological)
  const earliestSession = beforeSessions.length > 0
    ? beforeSessions.reduce((min, s) => s.startedAt < min ? s.startedAt : min, beforeSessions[0].startedAt)
    : null;

  return {
    a: metricsFrom(swapped ? afterSessions : beforeSessions),
    b: metricsFrom(swapped ? beforeSessions : afterSessions),
    earlier,
    later,
    swapped,
    beforeRange: { start: earliestSession, end: earlier.savedAt },
    afterRange: { start: earlier.savedAt, end: later.savedAt },
    excludedCount,
  };
}
