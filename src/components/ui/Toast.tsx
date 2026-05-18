import { Stamp } from "lucide-react";
import type { ToastState } from "../../types";

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.kind === "stamp" ? "toast-stamp" : ""}`} role="status">
      {toast.kind === "stamp" && <Stamp size={15} />}
      {toast.message}
    </div>
  );
}
