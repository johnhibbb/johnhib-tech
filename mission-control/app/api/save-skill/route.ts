import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WORKSPACE = "/Users/maria/.openclaw/workspaceconfigured.";
const SKILLS_DIR = path.join(WORKSPACE, "skills");

export async function POST(req: NextRequest) {
  try {
    const { name, content } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid skill name" }, { status: 400 });
    }

    const safeName = name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    const skillDir = path.join(SKILLS_DIR, safeName);

    // Create skills/ dir if it doesn't exist
    if (!fs.existsSync(SKILLS_DIR)) {
      fs.mkdirSync(SKILLS_DIR, { recursive: true });
    }

    // Create skill dir
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }

    const skillPath = path.join(skillDir, "SKILL.md");
    fs.writeFileSync(skillPath, content, "utf-8");

    return NextResponse.json({ ok: true, path: skillPath });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
