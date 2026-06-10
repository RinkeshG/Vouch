"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as store from "./_me";
import type { Entry, EventSource, Gut, Me, Stamp } from "./_me";
import type { Spot, Vouch } from "./_taste";

/* THE DATA SEAM. Every surface reads your map through this one hook — never a stray
   `loadMe()`. Today it's backed by localStorage (`_me.ts`); the day we wire accounts,
   the Supabase swap happens INSIDE this file and nothing downstream changes. The
   stored `Entry` shape is deliberately aligned to the future `user_place` columns
   (state / gut / take / occasions / at), so that migration is a lift, not a rewrite.

   Mutators return the fresh `Me` synchronously (localStorage is instant) AND update
   context state, so a caller can use the return value in the same tick (e.g. a count
   for a success moment) while every mounted surface re-renders reactively. */

type Mutators = {
  setStamp: (spot: Spot, stamp: Stamp, opts?: { gut?: Gut; line?: string; occ?: string[]; source?: EventSource }) => Me;
  addVouch: (v: Vouch) => Me;
  removeEntry: (name: string) => Me;
  toggleFollow: (name: string) => Me;
};
type Selectors = {
  getEntry: (name: string) => Entry | undefined;
  vouches: () => Vouch[];
  byStamp: (stamp: Stamp) => Entry[];
  isFollowing: (name: string) => boolean;
};
export type MyMap = { entries: Entry[]; follows: string[]; ready: boolean } & Mutators & Selectors;

const Ctx = createContext<MyMap | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me>({ entries: [], follows: [] });
  const [ready, setReady] = useState(false);

  // hydrate once on mount (client-only; SSR renders the empty, honest cold state)
  useEffect(() => { setMe(store.loadMe()); setReady(true); }, []);

  const setStamp = useCallback<Mutators["setStamp"]>((spot, stamp, opts) => {
    const next = store.setStamp(spot, stamp, opts); setMe(next); return next;
  }, []);
  const addVouch = useCallback<Mutators["addVouch"]>((v) => {
    const next = store.addVouch(v); setMe(next); return next;
  }, []);
  const removeEntry = useCallback<Mutators["removeEntry"]>((name) => {
    const next = store.removeEntry(name); setMe(next); return next;
  }, []);
  const toggleFollow = useCallback<Mutators["toggleFollow"]>((name) => {
    const next = store.toggleFollow(name); setMe(next); return next;
  }, []);

  // selectors read the in-memory state so they stay reactive (not localStorage)
  const getEntry = useCallback<Selectors["getEntry"]>((name) => me.entries.find((e) => e.spot.name === name), [me.entries]);
  const vouches = useCallback<Selectors["vouches"]>(() => me.entries
    .filter((e) => e.stamp === "vouched" && e.line)
    .map((e) => ({ spot: e.spot, line: e.line as string, occ: e.occ ?? [] })), [me.entries]);
  const byStamp = useCallback<Selectors["byStamp"]>((stamp) => me.entries.filter((e) => e.stamp === stamp), [me.entries]);
  const isFollowing = useCallback<Selectors["isFollowing"]>((name) => me.follows.includes(name), [me.follows]);

  const value: MyMap = {
    entries: me.entries, follows: me.follows, ready,
    setStamp, addVouch, removeEntry, toggleFollow,
    getEntry, vouches, byStamp, isFollowing,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMyMap(): MyMap {
  const c = useContext(Ctx);
  if (!c) throw new Error("useMyMap must be used within <MapProvider>");
  return c;
}
