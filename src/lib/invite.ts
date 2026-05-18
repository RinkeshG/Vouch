const INVITE_KEY = "vouch-pending-invite";

export function storePendingInvite(handle: string): void {
  const normalized = handle.trim().toLowerCase();
  if (!normalized) return;
  sessionStorage.setItem(INVITE_KEY, normalized);
}

export function readPendingInvite(): string | null {
  return sessionStorage.getItem(INVITE_KEY);
}

export function clearPendingInvite(): void {
  sessionStorage.removeItem(INVITE_KEY);
}

export function parseInviteFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const invite = params.get("invite")?.trim().toLowerCase();
  if (invite) {
    storePendingInvite(invite);
    return invite;
  }
  return readPendingInvite();
}

export function buildInviteUrl(baseUrl: string, handle: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set("invite", handle.toLowerCase());
  url.hash = "";
  return url.toString();
}
