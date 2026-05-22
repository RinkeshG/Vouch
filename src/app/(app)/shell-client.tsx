"use client";

import { BottomNav } from "@/components/app/bottom-nav";
import { DemoBanner } from "@/components/app/demo-banner";

interface AppShellClientProps {
  handle?: string;
  displayName?: string;
  avatarUrl?: string | null;
  isDemo?: boolean;
}

export function AppShellClient({ handle, isDemo }: AppShellClientProps) {
  return (
    <>
      {isDemo && <DemoBanner />}
      <BottomNav handle={handle} />
    </>
  );
}
