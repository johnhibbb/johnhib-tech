import type { FieldNote } from './types';

// ─── Field Notes ──────────────────────────────────────────────────────────────
// Short observations documented in the field. No demo required.
// Add new notes to the top of this array (newest first).

export const fieldNotes: FieldNote[] = [
  {
    slug: "it-keeps-forgetting-and-i-keep-showing-up",
    title: "It Keeps Forgetting and I Keep Showing Up",
    date: "March 2026",
    body: `Most people I talk to have tried AI once or twice and walked away with one of two reactions: it did something funny, or it didn't do what they wanted. Both end up in the same place. They stop.

The industry has oversold this thing so thoroughly that any gap between the promise and the reality feels like a failure. But I think the framing is wrong. The gap isn't a failure. It's the starting line.

What I keep running into is something different. Building a personal agent with access to my files, messages, and work… The problem I run into most often is that it forgets. Every new session, the memory of what we built the day before is partially or completely gone. Stopped asking why. Started fixing it. Memory protocol, improved context, tightened handoff. We're good for now but I know this won't be the last.

That cycle is the actual work. Not the prompt, not the output. The iteration. The beginning of any system is messy. That's not a problem with AI specifically, it's just what the beginning looks like. If you're waiting for a tool that works perfectly before you start, you'll be waiting for a long time. The people who are going to do something interesting with this technology are the ones who learned to read the gap and close it. Not the ones who never hit a gap at all.`,
  },
];
