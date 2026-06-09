import { ProducersHome } from "../../../components/vouch/direction-a";

export const metadata = { title: "Vouch — Your map" };

/* The home surface lives at the clean /home URL (the layout + _taste both assume it).
   /producers-home remains as the legacy working-name alias. */
export default function HomePage() {
  return <ProducersHome />;
}
