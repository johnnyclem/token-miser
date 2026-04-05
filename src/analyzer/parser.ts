import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";
import type { SessionData, ToolUsage, CostCategory } from "./types.js";

interface RawMessage {
  type?: string;
  message?: {
    role?: string;
    content?: string | Array<{ type?: string; tool_use_id?: string; name?: string }>;
    model?: string;
  };
  model?: string;
  costUSD?: number;
  duration?: number;
  tokens?: {
    input?: number;
    output?: number;
    cache_read?: number;
    cache_creation?: number;
  };
  sessionId?: string;
  timestamp?: string;
  tool_name?: string;
}

function findJsonlFiles(dir: string): string[] {
  const files: string[] = [];
  if (!existsSync(dir)) return files;

  function walk(current: string): void {
    let entries: string[];
    try {
      entries = readdirSync(current);
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(current, entry);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          walk(full);
        } else if (entry.endsWith(".jsonl")) {
          files.push(full);
        }
      } catch {
        // skip inaccessible files
      }
    }
  }

  walk(dir);
  return files;
}

function parseJsonlFile(filePath: string): RawMessage[] {
  const messages: RawMessage[] = [];
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return messages;
  }

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      messages.push(JSON.parse(trimmed) as RawMessage);
    } catch {
      // skip malformed lines
    }
  }
  return messages;
}

const CATEGORY_COLORS: Record<string, string> = {
  tool_result: "#f59e0b",
  assistant_output: "#3b82f6",
  thinking: "#8b5cf6",
  tool_call: "#10b981",
  user_prompt: "#ef4444",
  compaction: "#6366f1",
  system: "#64748b",
};

const TOOL_COLORS = [
  "#f59e0b", "#3b82f6", "#10b981", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

function buildSessionFromMessages(
  sessionId: string,
  projectName: string,
  messages: RawMessage[]
): SessionData {
  let totalCost = 0;
  let totalInput = 0;
  let totalOutput = 0;
  let totalCacheRead = 0;
  let totalCacheCreation = 0;
  let model = "claude-sonnet-4-20250514";
  let startTime: string | undefined;
  let compactions = 0;

  const toolCounts = new Map<string, { count: number; tokens: number; cost: number }>();
  const categoryCosts: Record<string, number> = {
    tool_result: 0,
    assistant_output: 0,
    thinking: 0,
    tool_call: 0,
    user_prompt: 0,
    compaction: 0,
    system: 0,
  };

  for (const msg of messages) {
    if (msg.timestamp && !startTime) {
      startTime = msg.timestamp;
    }
    if (msg.model) {
      model = msg.model;
    }
    if (msg.costUSD) {
      totalCost += msg.costUSD;
    }
    if (msg.tokens) {
      totalInput += msg.tokens.input ?? 0;
      totalOutput += msg.tokens.output ?? 0;
      totalCacheRead += msg.tokens.cache_read ?? 0;
      totalCacheCreation += msg.tokens.cache_creation ?? 0;
    }

    const role = msg.message?.role;
    const msgType = msg.type;
    const cost = msg.costUSD ?? 0;

    if (msgType === "summary" || msgType === "compaction") {
      compactions++;
      categoryCosts.compaction += cost;
    } else if (role === "assistant") {
      const content = msg.message?.content;
      if (Array.isArray(content)) {
        const hasToolUse = content.some((c) => c.type === "tool_use");
        if (hasToolUse) {
          categoryCosts.tool_call += cost * 0.3;
          categoryCosts.assistant_output += cost * 0.5;
          categoryCosts.thinking += cost * 0.2;
          for (const block of content) {
            if (block.type === "tool_use" && block.name) {
              const existing = toolCounts.get(block.name) ?? { count: 0, tokens: 0, cost: 0 };
              existing.count++;
              existing.tokens += (msg.tokens?.output ?? 0);
              existing.cost += cost * 0.3;
              toolCounts.set(block.name, existing);
            }
          }
        } else {
          categoryCosts.assistant_output += cost * 0.7;
          categoryCosts.thinking += cost * 0.3;
        }
      } else {
        categoryCosts.assistant_output += cost * 0.7;
        categoryCosts.thinking += cost * 0.3;
      }
    } else if (role === "user") {
      categoryCosts.user_prompt += cost;
    } else if (role === "tool") {
      categoryCosts.tool_result += cost;
      const toolName = msg.tool_name ?? "unknown";
      const existing = toolCounts.get(toolName) ?? { count: 0, tokens: 0, cost: 0 };
      existing.count++;
      existing.tokens += (msg.tokens?.input ?? 0);
      existing.cost += cost;
      toolCounts.set(toolName, existing);
    } else if (role === "system" || msgType === "system") {
      categoryCosts.system += cost;
    }
  }

  const totalTokens = totalInput + totalOutput;
  const cacheHitRate =
    totalInput > 0
      ? (totalCacheRead / (totalInput + totalCacheCreation)) * 100
      : 0;

  const tools: ToolUsage[] = Array.from(toolCounts.entries()).map(
    ([name, data], i) => ({
      tool_name: name,
      call_count: data.count,
      cost: Math.round(data.cost * 10000) / 10000,
      avg_tokens: data.count > 0 ? Math.round(data.tokens / data.count) : 0,
      tokens: data.tokens,
      count: data.count,
      color: TOOL_COLORS[i % TOOL_COLORS.length],
    })
  );

  const categoryLabels: Record<string, string> = {
    tool_result: "Tool Results",
    assistant_output: "Assistant Output",
    thinking: "Ext. Thinking",
    tool_call: "Tool Calls",
    user_prompt: "User Prompts",
    compaction: "Compaction",
    system: "System / CLAUDE.md",
  };

  const categories: CostCategory[] = Object.entries(categoryCosts).map(
    ([key, cost]) => ({
      category: key,
      label: categoryLabels[key] ?? key,
      cost: Math.round(cost * 10000) / 10000,
      color: CATEGORY_COLORS[key] ?? "#94a3b8",
    })
  );

  const durationMs = messages.length * 2500;
  const mins = Math.floor(durationMs / 60000);
  const secs = Math.floor((durationMs % 60000) / 1000);

  return {
    id: sessionId,
    project: projectName,
    startedAt: startTime ?? new Date().toISOString(),
    duration: `${mins}m ${secs}s`,
    model,
    cost: Math.round(totalCost * 10000) / 10000,
    tokens: totalTokens,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    tools: tools.sort((a, b) => b.cost - a.cost),
    categories: categories.sort((a, b) => b.cost - a.cost),
  };
}

function generateMockData(): SessionData[] {
  const projects = ["token-miser", "web-app", "api-service"];
  const models = ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-haiku-3.5-20241022"];
  const toolNames = ["Read", "Edit", "Bash", "Grep", "Glob", "Write", "WebSearch"];
  const sessions: SessionData[] = [];

  for (let i = 0; i < 12; i++) {
    const project = projects[i % projects.length];
    const model = models[i % models.length];
    const baseCost = 0.15 + Math.random() * 0.85;
    const totalTokens = 20000 + Math.floor(Math.random() * 180000);
    const cacheHit = 30 + Math.random() * 55;

    const date = new Date();
    date.setDate(date.getDate() - i);

    const tools: ToolUsage[] = toolNames
      .slice(0, 3 + Math.floor(Math.random() * 4))
      .map((name, j) => {
        const count = 2 + Math.floor(Math.random() * 25);
        const tokens = count * (500 + Math.floor(Math.random() * 3000));
        return {
          tool_name: name,
          call_count: count,
          cost: Math.round(baseCost * (0.1 + Math.random() * 0.3) * 10000) / 10000,
          avg_tokens: Math.round(tokens / count),
          tokens,
          count,
          color: TOOL_COLORS[j % TOOL_COLORS.length],
        };
      });

    const categoryDefs: Array<[string, string, number]> = [
      ["tool_result", "Tool Results", 0.35],
      ["assistant_output", "Assistant Output", 0.25],
      ["thinking", "Ext. Thinking", 0.18],
      ["tool_call", "Tool Calls", 0.10],
      ["user_prompt", "User Prompts", 0.05],
      ["compaction", "Compaction", 0.04],
      ["system", "System / CLAUDE.md", 0.03],
    ];

    const categories: CostCategory[] = categoryDefs.map(([key, label, pct]) => ({
      category: key,
      label,
      cost: Math.round(baseCost * pct * 10000) / 10000,
      color: CATEGORY_COLORS[key] ?? "#94a3b8",
    }));

    const mins = 5 + Math.floor(Math.random() * 55);
    const secs = Math.floor(Math.random() * 60);

    sessions.push({
      id: `session-${date.toISOString().slice(0, 10)}-${i.toString().padStart(3, "0")}`,
      project,
      startedAt: date.toISOString(),
      duration: `${mins}m ${secs}s`,
      model,
      cost: Math.round(baseCost * 10000) / 10000,
      tokens: totalTokens,
      cacheHitRate: Math.round(cacheHit * 100) / 100,
      tools,
      categories,
    });
  }

  return sessions;
}

export async function parseSessions(): Promise<SessionData[]> {
  const projectsDir = join(homedir(), ".claude", "projects");
  const jsonlFiles = findJsonlFiles(projectsDir);

  if (jsonlFiles.length === 0) {
    return generateMockData();
  }

  const sessions: SessionData[] = [];

  for (const filePath of jsonlFiles) {
    const messages = parseJsonlFile(filePath);
    if (messages.length === 0) continue;

    const sessionId = basename(filePath, ".jsonl");
    const pathParts = filePath.replace(projectsDir + "/", "").split("/");
    const projectName = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "unknown";

    sessions.push(buildSessionFromMessages(sessionId, projectName, messages));
  }

  return sessions.length > 0 ? sessions : generateMockData();
}
