import type { Metadata } from "next";
import { getGuide, listGuides } from "../lib/guides";
import GuideView from "./GuideView";
import LocalGuide from "./LocalGuide";

type Params = { handle: string };

export function generateStaticParams() {
  return listGuides().map((g) => ({ handle: g.handle }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { handle } = await params;
  const guide = getGuide(handle);
  if (!guide) return { title: "Not found — Hotlist" };
  const title = `${guide.title} — a Hotlist by ${guide.curator.name}`;
  const description = guide.intro;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile", siteName: "Hotlist" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  const guide = getGuide(handle);
  if (!guide) return <LocalGuide handle={handle.toLowerCase()} />;
  return <GuideView guide={guide} />;
}
