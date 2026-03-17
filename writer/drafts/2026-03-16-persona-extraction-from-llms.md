# Persona Extraction from LLMs (And Why It's the Best Way to Start With OpenClaw)

Before you write a single config file or system prompt for your AI agent, do this: ask your existing LLMs who you are.

This sounds strange. It isn't. If you've been using ChatGPT, Gemini, or Grok for any length of time, those models have been pattern-matching your questions, your language, your priorities, your blind spots. They can't remember specific conversations — but they can infer from how you interact a surprisingly accurate picture of who you are. That inference is already sitting there. You just haven't asked for it yet.

The technique is simple. Ask each model directly: "Based on our interactions, describe me as a person. My values, working style, what I care about, how I communicate. Be specific — not a flattering summary, an honest one." Then push. Ask about blind spots. Ask what you seem to be building toward. Ask where you're inconsistent. Vague answers deserve follow-up.

Do this across three or four models. Each will surface different facets.

## What comes back

From three separate models, the output covered career arc and ambitions — with accurate specifics about consulting, YouTube, AI tools — alongside working style, aesthetic instincts, recurring themes across years of conversation, and things I hadn't consciously named as patterns. No single output was complete. Overlapping them produced something more accurate than any self-description I would have written from scratch, because the models weren't deferring to what I wanted to hear.

That's the value. It's not that the models know you better than you know yourself. It's that they don't have the same incentive to soften the picture.

## Why this matters for OpenClaw

An AI agent without context about its user is a general-purpose tool. With real context, it becomes something closer to a collaborator — one that can anticipate what you need, push back when you're veering wrong, and maintain continuity across sessions without being re-trained every time.

The extracted persona becomes three foundational files. `SOUL.md` defines who the agent is — how it operates, what it values, how it communicates, what it won't do. `USER.md` is the user profile: career, projects, communication style, working patterns, relationships, the full picture. `IDENTITY.md` is the agent's own sense of self, shaped partly by the persona work and partly by the relationship between the two of you.

Together, these files replace weeks of accumulated context. The agent starts from a reasonably accurate baseline on day one instead of learning who you are across dozens of sessions that eventually get truncated or forgotten.

## The name came from this

The agent's name — María — wasn't assigned. It was chosen in a first session, after the persona work had already established who she was supposed to be and who she was supposed to serve.

The framing I gave her: *extremely intelligent and thoughtful understudy.* Not a tool, not a chatbot — someone learning the role from the inside. That framing only lands because the underlying context was already there. Without the extraction work, it would have been a name attached to nothing.

## Start with the mirrors

Before you set up OpenClaw, before you write a system prompt, open the tools you already use. Ask them who you are. Take notes. Be honest about where they're right and where they're projecting.

Then bring that into your agent setup. The difference between an agent that works from day one and one that takes weeks to calibrate is almost entirely in this step.

---

## What Changed

- **Collapsed the "What you get" section.** The original used a bullet list to enumerate what came back from the extraction — career arc, working style, aesthetic instincts, etc. Converted to a single paragraph that builds toward the actual insight: the models' value is their lack of incentive to soften the picture. That's a sharper point than the list was making.
- **Sharpened the three-file explanation.** The original used bold labels followed by indented descriptions — visually a list, functionally a list. Rewrote as a single connected sentence per concept so the relationship between the files is clearer.
- **Let the María naming breathe without overselling it.** The original raised the question of whether to lean into the naming or let it be a quiet detail. Kept it short but gave it a second sentence that earns its presence: "That framing only lands because the underlying context was already there." The naming isn't the point — the continuity it represents is.
- **Rewrote the ending.** The original closed with "it will save you weeks," which is accurate but a weak landing for the piece. Replaced with a more specific claim — the difference between day-one calibration and slow drift — so the ending is a real observation rather than a reassurance.
- **Removed the warm-up second paragraph.** "This sounds strange. It isn't." was the right instinct, but the sentence that followed ("If you've been using ChatGPT...") was doing the same work. Merged them so the pivot earns its place.
