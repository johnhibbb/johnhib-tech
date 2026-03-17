# Learnings — OpenClaw on UTM (macOS VM)

> Maintained by María. Updated as we discover constraints, mistakes, and lessons.  
> **Environment:** OpenClaw running inside a UTM virtual machine on macOS (Apple Silicon).

---

## ⚠️ Hard Constraint: No Docker in This Environment

**Date discovered:** 2026-02-23  
**Severity:** System-breaking  
**Status:** Resolved — sandbox mode disabled

### What happened

During a security hardening session, `agents.defaults.sandbox.mode` was set to `"all"`.  
This caused OpenClaw to require Docker to inspect/run sandbox images on every agent turn.  
Since Docker is not installed (and cannot run reliably inside UTM on macOS), the gateway  
crashed on every request with:

```
Error: Failed to inspect sandbox image: failed to connect to the docker API
at unix:///var/run/docker.sock; check if the path is correct and if the daemon
is running: dial unix /var/run/docker.sock: connect: no such file or directory
```

### Fix applied

```json
"agents": {
  "defaults": {
    "sandbox": {
      "mode": "off"
    }
  }
}
```

### Root cause

UTM VMs on macOS do not support Docker reliably. Docker requires Linux kernel features  
(namespaces, cgroups) that are not available or are emulated poorly in macOS virtualization.  
Running Docker-in-VM on UTM/Apple Silicon causes instability and is not a supported path  
for OpenClaw sandboxing.

### Rule going forward

> **Never enable `sandbox.mode: "all"` (or any Docker-dependent feature) in this environment.**  
> Any skill, plugin, or config change that requires Docker must be rejected or deferred  
> until the environment changes (e.g., moving to a Linux VPS or dedicated hardware).

---

## ⚠️ Secondary Issue: Auth Disabled During Emergency Revert

**Date:** 2026-02-23  
**Severity:** Medium (security regression, quickly caught)

When the sandbox crash was fixed by reverting config, `gateway.auth.mode` was accidentally  
set to `"none"`, removing all gateway authentication.

**Always check auth mode after any emergency config change.**  
The gateway password lives in `~/.zshenv` as `OPENCLAW_GATEWAY_PASSWORD` — it does not need  
to be in `openclaw.json`. Restoring auth is just setting `"mode": "password"` back.

---

## ✅ Security Hardening Session Summary (2026-02-23)

### Completed high priority fixes

| Fix | Status |
|-----|--------|
| FileVault disk encryption | ✅ Enabled (encrypting) |
| macOS Application Firewall | ✅ Enabled |
| Google API key out of config | ✅ Moved to `~/.zshenv` as `GOOGLE_API_KEY` |
| Perplexity/OpenRouter key out of config | ✅ Moved to `~/.zshenv` as `OPENROUTER_API_KEY` |
| Gateway password out of config | ✅ Moved to `~/.zshenv` as `OPENCLAW_GATEWAY_PASSWORD` |
| OpenClaw updated | ✅ v2026.2.22-2 (stable, current) |
| Daily update check cron | ✅ `healthcheck:update-status` @ 9:00 AM PST |

### Completed medium priority fixes

| Fix | Status |
|-----|--------|
| `tools.elevated.enabled: false` | ✅ /elevated mode disabled |
| `tools.fs.workspaceOnly: true` | ✅ File access restricted to workspace |
| `channels.whatsapp.dmPolicy: "pairing"` | ✅ DM gating in place for when WhatsApp is re-enabled |
| `agents.defaults.sandbox.mode: "off"` | ✅ Explicit — Docker not available in this environment |

### Current security audit posture

```
0 critical · 1 warn · 0 info (as of 2026-02-23)
Remaining warn: gateway.trusted_proxies_missing (non-issue — not behind a reverse proxy)
tools.elevated: disabled ✅
```

---

## 📋 Environment Constraints Reference

| Constraint | Detail |
|------------|--------|
| **No Docker** | UTM macOS VM — Docker not supported. Breaks sandbox mode. |
| **No `pfctl`** | macOS firewall CLI not available in this shell context |
| **No `netstat`/`ss`** | Port scanning requires `lsof` (also limited in sandbox) |
| **No `softwareupdate`** | macOS system update CLI not available |
| **No `networksetup`** | Network config CLI not in PATH |
| **Firewall** | macOS Application Firewall managed via System Settings only |
| **FileVault** | Managed via System Settings only |

---

## 📌 Ongoing Reminders

- Before installing any skill or plugin: check if it requires Docker or system-level daemons
- After any emergency config change: always run `openclaw security audit` to catch regressions
- `~/.zshenv` holds all secrets (Google API key, OpenRouter key, gateway password) — never re-add to `openclaw.json`
- Sandbox mode requires Docker — do not enable unless Docker is explicitly installed and verified

---

*Last updated: 2026-02-23 by María*
