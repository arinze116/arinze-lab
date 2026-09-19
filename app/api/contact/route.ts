import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

// This route validates and sends contact form submissions via Resend.
// Set RESEND_API_KEY in .env.local before this will actually send email.

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const contactRate = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const rate = contactRate.get(key);
  if (!rate || rate.resetAt <= now) contactRate.set(key, { count: 1, resetAt: now + 60_000 });
  else {
    rate.count += 1;
    if (rate.count > 5) return NextResponse.json({ error: "Please try again later." }, { status: 429 });
  }
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 16_000) return NextResponse.json({ error: "Invalid request body." }, { status: 413 });
  if (req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 415 });
  }
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const input = body && typeof body === "object" ? body as Partial<ContactPayload> : {};
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const subject = typeof input.subject === "string" ? input.subject.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  if (name.length > 120 || subject.length > 200) {
    return NextResponse.json(
      { error: "Name or subject is too long." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (message.length < 20) {
    return NextResponse.json(
      { error: "Your message must be at least 20 characters." },
      { status: 400 },
    );
  }

  if (message.length > 3000) {
    return NextResponse.json(
      { error: "Your message cannot exceed 3000 characters." },
      { status: 400 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.error(
      "RESEND_API_KEY is missing — check .env.local and restart the dev server.",
    );
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "Arinze Lab <onboarding@resend.dev>",
      to: "arinzelabs@gmail.com",
      replyTo: email,
      subject: `[Arinze Lab] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    if (error) {
      console.error("Resend returned an error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again later." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
