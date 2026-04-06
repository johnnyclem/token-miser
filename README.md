# token-miser

Claude Code token usage analyzer — cost breakdowns, optimization suggestions, and A/B harness testing.

Your biggest optimization lever isn't what Claude writes — it's what Claude reads.

## Quick Start

```bash
# Install globally
npm install -g token-miser

# Or use npx — no install needed
npx token-miser analyze
```

## Features

- **Cost breakdown by category** — Tool Results, Assistant Output, Ext. Thinking, Tool Calls, User Prompts, Compaction, System/CLAUDE.md
- **Per-tool analysis** — See which tools cost the most and how often they're called
- **Cache hit rate tracking** — Monitor prompt caching effectiveness
- **Optimization suggestions** — Prioritized by estimated savings with effort levels
- **A/B test harnesses** — Save config snapshots and compare side-by-side
- **Config diff viewer** — See exactly what changed between harnesses
- **Interactive dashboard** — Browser-based visualization with Recharts
- **Zero config** — Reads `~/.claude/projects/` JSONL logs automatically

## Commands

```bash
# Analyze token usage
token-miser analyze

# Open interactive dashboard
token-miser analyze --dashboard

# Export as JSON
token-miser analyze aggregate --json

# Get optimization suggestions
token-miser suggest

# Save a baseline harness
token-miser harness save baseline "Before optimization"

# List saved harnesses
token-miser harness list

# Compare two harnesses
token-miser compare baseline optimized-v1
```

## How It Works

1. **Reads** your `~/.claude/projects/` JSONL logs
2. **Aggregates** costs, token flows, cache rates, tool usage, and model splits across all sessions
3. **Generates** prioritized optimization suggestions with estimated savings
4. **Snapshots** your CLAUDE.md, .claudeignore, and settings.json as named harnesses
5. **Compares** harness snapshots side-by-side with cost deltas and config diffs

## A/B Testing Workflow

```bash
# 1. Save your current config as a baseline
token-miser harness save baseline "Before cache tweaks"

# 2. Use Claude normally for a day (or 5+ sessions)

# 3. Make your optimization change (e.g., add .claudeignore rules)

# 4. Save the optimized config
token-miser harness save optimized-v1 "With better caching"

# 5. Use Claude for another day with the new config

# 6. Compare results — sessions are attributed by timestamp
token-miser compare baseline optimized-v1
```

### How Timestamp Attribution Works

When you run `compare`, token-miser uses the `savedAt` timestamp on each harness to attribute sessions to time periods:

- **Before baseline**: All sessions before the baseline was saved
- **Between saves**: Sessions between the baseline and optimized-v1 save times

This means you don't need to tag sessions manually. Just save a harness, use Claude, save another harness, and compare. The tool filters your `~/.claude/projects/` session logs by timestamp automatically.

The compare output shows:
- **Per-session cost delta** — the headline metric ("saves X% per session")
- **Per-category breakdown** — which cost categories improved (Tool Results, Thinking, etc.)
- **Top tools comparison** — per-tool cost changes across the two periods
- **Config diff** — what settings actually changed between harnesses

Sessions after the later harness are excluded — they belong to a future experiment.

## License

MIT
