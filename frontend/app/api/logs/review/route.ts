import { logPrReview } from "@/lib/data/activity-logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { repoFullName, prNumber, prTitle, prGithubId } = await req.json();
  await logPrReview(repoFullName, prNumber, prTitle, prGithubId);
  return NextResponse.json({ ok: true });
}