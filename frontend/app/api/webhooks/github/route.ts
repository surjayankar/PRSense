import { handleInstallationCreated, handlePullRequestOpened } from "@/lib/handlers/github";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const event = req.headers.get("x-github-event");

  if (event === "installation") {
    await handleInstallationCreated(payload);
  } else if (event === "pull_request" && payload.action === "opened") {
    await handlePullRequestOpened(payload);
    // Forward to backend for AI review
    await fetch(`${process.env.BACKEND_URL}/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "pull_request", payload }),
    });
  } else if (event === "issues" && payload.action === "opened") {
    await fetch(`${process.env.BACKEND_URL}/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "issues", payload }),
    });
  }

  return NextResponse.json({ ok: true });
}