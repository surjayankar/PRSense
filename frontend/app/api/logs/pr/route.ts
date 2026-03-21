import { logPrCreation } from "@/lib/data/activity-logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { repoFullName, prNumber, prTitle, prGithubId, issueNumber } =
      await req.json();
    await logPrCreation(repoFullName, prNumber, prTitle, issueNumber);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error logging PR creation:", error);
    return NextResponse.json({ error: "Failed to log PR" }, { status: 500 });
  }
}