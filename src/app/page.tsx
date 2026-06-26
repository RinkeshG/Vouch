import { redirect } from "next/navigation";

/* The front door is the v3 landing. It carries its own layout (theme + fonts +
   the .v3 shell), so we send the root route there rather than re-render it under
   the root layout. The old _landing/ page is kept in the tree, just unwired. */
export default function RootPage() {
  redirect("/v3");
}
