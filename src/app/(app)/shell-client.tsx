"use client";

import { BottomNav } from "@/components/app/bottom-nav";

interface AppShellClientProps {
  handle?: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export function AppShellClient({ handle }: AppShellClientProps) {
  return <BottomNav handle={handle} />;
}
