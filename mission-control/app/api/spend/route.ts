import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return NextResponse.json({ error: "No OPENROUTER_API_KEY" }, { status: 500 });

  try {
    const [keyRes, creditsRes] = await Promise.all([
      fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      }),
      fetch("https://openrouter.ai/api/v1/credits", {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      }),
    ]);

    const keyData = await keyRes.json();
    const creditsData = await creditsRes.json();

    return NextResponse.json({
      openrouter: {
        usage: keyData.data?.usage ?? 0,
        usage_daily: keyData.data?.usage_daily ?? 0,
        usage_weekly: keyData.data?.usage_weekly ?? 0,
        usage_monthly: keyData.data?.usage_monthly ?? 0,
        total_credits: creditsData.data?.total_credits ?? 0,
        balance: (creditsData.data?.total_credits ?? 0) - (keyData.data?.usage ?? 0),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
