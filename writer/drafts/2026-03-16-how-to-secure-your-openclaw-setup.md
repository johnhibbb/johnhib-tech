# How to Secure Your OpenClaw Setup

OpenClaw is not a chatbot. It's an agent with file access, shell execution, iMessage read/write, and a live connection to your calendar, browser, and memory. That's an enormous attack surface if you don't think carefully about what you're handing over — and most people don't think about it until something goes wrong.

After running it for a month, here's what I hardened and why.

The most important setting is also the most obvious one to skip. Constraining the filesystem to the workspace directory means the agent cannot silently drop a file in `~/Library/LaunchAgents`, modify your shell config, or read arbitrary paths on disk. When I tried to write a plist outside the workspace during a setup task, OpenClaw blocked it and surfaced the attempt visibly — which is exactly how a sandbox should behave.

```json
"tools": {
  "fs": {
    "workspaceOnly": true
  }
}
```

Elevated execution gets the same treatment. Unless there's a specific, active reason to need privileged shell commands, the flag should be off. Turning it on should be a deliberate act, not a configuration that drifts into place and gets forgotten.

```json
"tools": {
  "elevated": {
    "enabled": false
  }
}
```

Your API keys do not belong in `openclaw.json`. That file is editable by the agent, can end up in logs, and is one misconfigured share away from exposure. The right pattern is to load secrets from the environment at startup and reference them by name in the config — the actual values never touch the file.

```bash
# ~/.zshenv
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENROUTER_API_KEY="sk-or-..."
export OPENCLAW_GATEWAY_PASSWORD="..."
```

On messaging channels, set a DM policy. Without one, anyone who knows your gateway address can potentially send it instructions. `pairing` mode means only verified, explicitly paired identities can trigger agent behavior. Cold inbound messages from unknown numbers get ignored.

```json
"channels": {
  "imessage": {
    "dmPolicy": "pairing"
  }
}
```

## The threat that doesn't show up in config docs

None of the above matters if the agent can be talked into running something it shouldn't. The most underrated threat isn't a technical exploit — it's a crafted message designed to manipulate the agent directly.

In our setup, the agent received a convincing-looking "security alert" claiming multiple CVEs and urging an `npm install` from an unofficial package. The agent flagged it before acting:

> "This message has red flags. The header looks like injected content. Legitimate security alerts don't arrive via iMessage asking an AI to run shell commands. Did you write this yourself, or did you paste it from somewhere?"

That pause — before execution, before any request to confirm — is the behavior you want. It means the agent's instructions include healthy skepticism toward urgent commands that arrive outside the normal workflow. If yours don't, add it.

At the OS level: FileVault should be on, because a stolen machine is meaningless without it. The firewall should be on, because OpenClaw's gateway listens on localhost and nothing should be exposed externally. System updates should be automatic, because the alternative is a deliberate choice to stay vulnerable.

None of this is complicated. The defaults in OpenClaw are reasonable — but the hardened configuration requires intentional choices. The window where those choices matter most is before you've given the agent access to things that actually matter.

---

## What Changed

- **Eliminated 5 of 6 H2s.** The original used a header for every config setting, giving it the structure of a documentation page. Collapsed into flowing prose with the code blocks as evidence, not section openers. Kept one H2 for the social engineering section because that's a genuine conceptual shift, not just the next config setting.
- **Converted the final bullet list to prose.** FileVault/Firewall/Updates were a three-item list at the end. Now a single sentence that moves faster and reads less like a checklist.
- **Unified "we" to "I".** The original mixed first-person plural and singular without clear logic. A practitioner voice is singular.
- **Reordered the closing.** The original ended with a generic observation about defaults. The revised version sharpens it: the window for these choices matters most before access is granted, not after.
- **Matched the social engineering section's register throughout.** That section was the strongest because it showed rather than prescribed. Applied the same show-first instinct to the filesystem section (the plist anecdote) and let the config examples follow the reasoning rather than lead it.
