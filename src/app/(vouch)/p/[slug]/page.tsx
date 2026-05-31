"use client";
import { useParams } from "next/navigation";
import { PalatePage } from "../../../../components/vouch/palate-page";

export default function OtherPalatePage() {
  const params = useParams();
  return <PalatePage slug={String(params?.slug ?? "")} />;
}
