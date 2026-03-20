import { getFilteredLogs } from "@/lib/data/logs";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const result = await getFilteredLogs(userId, {
    type: searchParams.get("type"),
    repoId: searchParams.get("repoId"),
    startDate: searchParams.get("startDate"),
    endDate: searchParams.get("endDate"),
  });

  return NextResponse.json(result ?? { logs: [], repositories: [] });
}