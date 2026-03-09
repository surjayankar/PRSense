"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@clerk/nextjs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex">
      {isSignedIn && <AppSidebar />}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}