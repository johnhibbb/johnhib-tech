# HEARTBEAT.md

## Tasks

- Check for official OpenClaw updates. If a new version is available, update OpenClaw, send a concise TLDR of what's new via iMessage, then restart the gateway.

## Context Window Monitor

- Run `session_status` and check the context usage percentage.
- If context is ≥85%: 
  1. Run `session_status` and note current usage % and session model.
  2. Fetch OpenRouter live spend: `curl -s -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/auth/key` — capture usage, usage_daily, usage_weekly, usage_monthly, balance.
  3. Write an intentional pre-compaction archive to `memory/sessions/YYYY-MM-DD.md` — include:
     - Rich account of decisions made, code written, context established, what John cares about (human-prioritized)
     - **Usage snapshot section**: session context %, model used, OR live data (daily/weekly/monthly burn + balance), Anthropic balance estimate
  4. Post the archive to Discord `#memory` channel (`1476449855822889093`) in 1-2 chunked messages (2000 char limit per message).
  5. Send John a message via iMessage (+19175355701) saying: "Context window at [X]% — archive saved to #memory. OR balance: $[Y]. Time to /new."
  6. Append key items to `memory/YYYY-MM-DD.md` daily log before signing off.
- If context is <85%: no action needed.
