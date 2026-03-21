import { upsertRepository } from "../data/repositories";
import { prisma } from "../prisma";

export async function handleInstallationCreated(payload: any) {
  try {
    const installationId = payload.installation.id;
    const accountLogin = payload.installation.account.login;
    const repositories = payload.repositories || [];

    const existingInstallation = await prisma.installation.findUnique({
      where: { installationId },
    });

    if (existingInstallation) {
      if (existingInstallation.accountLogin === "pending") {
        await prisma.installation.update({
          where: { id: existingInstallation.id },
          data: { accountLogin },
        });
      }

      for (const repo of repositories) {
        await upsertRepository(
          repo.id,
          repo.name,
          repo.full_name,
          existingInstallation.id,
        );
      }
    }
  } catch (error) {
    console.error("handleInstallationCreated error:", error);
  }
}

export async function handlePullRequestOpened(payload: any) {
  try {
    const installationId = payload.installation.id;
    const pr = payload.pull_request;
    const repo = payload.repository;

    const installation = await prisma.installation.findUnique({
      where: { installationId },
      include: { user: true },
    });

    if (!installation) {
      console.error("Installation not found:", installationId);
      return;
    }

    // Upsert the repo so it exists in our DB before the backend logs the review
    await upsertRepository(
      repo.id,
      repo.name,
      repo.full_name,
      installation.id,
    );

    // Determine whether this is an auto-generated PRSense PR
    const headBranch: string = pr.head?.ref || "";
    const isAutoPR = headBranch.startsWith("PRSense/");

    // Increment usage counters only — PR record is created by logPrReview/logPrCreation
    // after the AI finishes, avoiding duplicate rows.
    if (isAutoPR) {
      await prisma.user.update({
        where: { id: installation.userId },
        data: {
          prsCreated: { increment: 1 },
          prsUsed: { increment: 1 },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: installation.userId },
        data: { prsUsed: { increment: 1 } },
      });
    }
  } catch (error) {
    console.error("handlePullRequestOpened error:", error);
  }
}