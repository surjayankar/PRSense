import {
  handleInstallationCreated,
  handlePullRequestOpened,
} from "@/lib/handlers/github";
import { NextRequest, NextResponse } from "next/server";

async function verifyGitHubSignature(
  req: NextRequest,
  body: string,
): Promise<boolean> {
  const signature = req.headers.get("x-hub-signature-256");
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!signature || !secret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expected =
    "sha256=" +
    Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  const isValid = await verifyGitHubSignature(req, body);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = req.headers.get("x-github-event");
  const backendUrl = process.env.BACKEND_URL;

  if (event === "installation") {
    await handleInstallationCreated(payload);

    // Trigger codebase indexing via backend → Inngest
    await fetch(`${backendUrl}/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "installation", payload }),
    });
  } else if (event === "pull_request" && payload.action === "opened") {
    await handlePullRequestOpened(payload);

    // Forward to backend for AI review
    await fetch(`${backendUrl}/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "pull_request", payload }),
    });
  } else if (event === "issues" && payload.action === "opened") {
    // Forward to backend for AI issue analysis
    await fetch(`${backendUrl}/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "issues", payload }),
    });
  } else if (event === "issue_comment" && payload.action === "created") {
    // Forward to backend — triggers auto-PR if comment contains /fix
    await fetch(`${backendUrl}/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "issue_comment", payload }),
    });
  }

  return NextResponse.json({ ok: true });
}