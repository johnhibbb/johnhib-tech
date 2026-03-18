import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { name, email, subject, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ error: "Email and message are required." }, { status: 400 });
    }

    await resend.emails.send({
      from:    "Contact Form <onboarding@resend.dev>",
      to:      "hello@johnhib.com",
      replyTo: email,
      subject: subject || "New message from johnhib.tech",
      text:    `From: ${name || "Anonymous"} <${email}>\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Failed to send." }, { status: 500 });
  }
}
