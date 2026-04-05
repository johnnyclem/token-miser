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
token-miser harness save baseline "Before optimization"

# 2. Apply one suggestion at a time
# 3. Run 5+ representative sessions

# 4. Save the optimized config
token-miser harness save optimized-v1 "After thinking cap"

# 5. Compare results
token-miser compare baseline optimized-v1
```

## License

MIT
