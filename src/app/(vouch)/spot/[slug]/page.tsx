"use client";
import { useParams } from "next/navigation";
import { SpotPage } from "../../../../components/vouch/spot-page";

export default function SpotRoute() {
  const params = useParams();
  return <SpotPage slug={String(params?.slug ?? "")} />;
}
