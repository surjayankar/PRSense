import { logIndexingUpdate } from "@/lib/data/activity-logger";
import { IndexingStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { repoFullName, status } = await req.json();
  await logIndexingUpdate(repoFullName, status as IndexingStatus);
  return NextResponse.json({ ok: true });
}