import { buildChartData, getDashboardStats } from "@/lib/data/logs";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDashboardStats(userId)
    if (!stats) {
    return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
    );
    }

    const { user, installation, repositories, totalPRs, totalIssues, prsByDate, issuesByDate } = stats
    const chartData = buildChartData(prsByDate, issuesByDate)

    return NextResponse.json({
      user: {
        email: user.email,
        plan: user.plan,
        prsUsed: user.prsUsed,
        prsCreated: user.prsCreated,
        issuesUsed: user.issuesUsed,
        chatMessagesUsed: user.chatMessagesUsed,
        billingCycleStart: user.billingCycleStart
      },
      stats: {
        totalPRs,
        totalIssues,
        repoCount: repositories.length,
        repoName: repositories[0]?.fullName || "No repository connected",
        indexingStatus: repositories[0]?.indexingStatus || "NOT_STARTED",
        githubAccount: installation?.accountLogin|| null

      },
      chartData,
      limits: PLAN_LIMITS
    })
  } catch (error) {
    return NextResponse.json(
      { error: "internal server used" },
      { status: 500 },
    )
  }
}