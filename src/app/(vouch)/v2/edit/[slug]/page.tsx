"use client";
import { useParams } from "next/navigation";
import { Builder } from "../../../../../components/v2/builder";
import { getGuide } from "../../../../../components/v2/data";
import { LinkButton, LostIcon, StatePanel } from "../../../../../components/v2/kit";

export default function EditGuide() {
  const params = useParams<{ slug: string }>();
  const guide = getGuide(params.slug);
  if (!guide) return <main><StatePanel icon={<LostIcon />} title="no draft here." body="this guide isn't on this device — drafts live in the browser you made them in." actions={<LinkButton href="/v2">back to your guides →</LinkButton>} /></main>;
  return <Builder initial={guide} />;
}
