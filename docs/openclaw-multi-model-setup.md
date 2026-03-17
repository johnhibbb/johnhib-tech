# OpenClaw Multi-Model Setup Guide

## How Model Switching Works

OpenClaw supports multiple AI models via `agents.defaults.models` (the catalog) and `agents.defaults.model` (primary + fallbacks). You can switch between models at runtime using `/model <alias>`.

## Current Configuration

### Primary Model
- **Model:** `anthropic/claude-opus-4-6`
- **Alias:** `opus`
- **Provider:** Anthropic (direct API)

### Fallback Model
- **Model:** `google/gemini-3-pro-preview`
- **Alias:** `gemini`
- **Provider:** Google (API key set via `env.GOOGLE_API_KEY`)

## Config Structure

```json5
{
  // API keys for non-Anthropic providers
  env: {
    GOOGLE_API_KEY: "your-google-api-key"
  },

  agents: {
    defaults: {
      // Model catalog (what's available + aliases)
      models: {
        "anthropic/claude-opus-4-6": { alias: "opus" },
        "google/gemini-3-pro-preview": { alias: "gemini" }
      },

      // Primary + fallback chain
      model: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["google/gemini-3-pro-preview"]
      }
    }
  }
}
```

## Switching Models

Use the `/model` command in chat:
- `/model gemini` — switch to Gemini 3 Pro
- `/model opus` — switch back to Claude Opus 4.6
- `/model default` — reset to primary model

## Built-in Alias Shorthands

| Alias          | Model                           |
|----------------|----------------------------------|
| `opus`         | `anthropic/claude-opus-4-6`     |
| `sonnet`       | `anthropic/claude-sonnet-4-5`   |
| `gpt`          | `openai/gpt-5.2`               |
| `gpt-mini`     | `openai/gpt-5-mini`            |
| `gemini`       | `google/gemini-3-pro-preview`   |
| `gemini-flash` | `google/gemini-3-flash-preview` |

> Built-in aliases only apply when the model is in `agents.defaults.models`. Custom aliases always take priority.

## Adding More Models

To add another model, add it to `agents.defaults.models` and set the appropriate API key:

```json5
{
  env: {
    OPENAI_API_KEY: "sk-..."
  },
  agents: {
    defaults: {
      models: {
        "openai/gpt-5.2": { alias: "gpt" }
      }
    }
  }
}
```

For custom/self-hosted providers, use `models.providers` with `baseUrl`, `api`, and a `models` array.

## Reference
- [OpenClaw Configuration Reference](https://docs.openclaw.ai/gateway/configuration-reference)
- [OpenClaw Configuration Guide](https://docs.openclaw.ai/gateway/configuration)
