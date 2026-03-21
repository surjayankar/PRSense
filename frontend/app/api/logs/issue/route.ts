import { logIssueAnalysis } from "@/lib/data/activity-logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { repoFullName, issueNumber, issueTitle, issueGithubId } =
      await req.json();
    await logIssueAnalysis(repoFullName, issueNumber, issueTitle, issueGithubId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error logging issue analysis:", error);
    return NextResponse.json({ error: "Failed to log issue" }, { status: 500 });
  }
}