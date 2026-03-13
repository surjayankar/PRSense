import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async (req: NextRequest) => {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user?.polarCustomerId) {
        throw new Error("Customer not found");
    }

    return user.polarCustomerId;
  },
  server: "sandbox", // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise
});