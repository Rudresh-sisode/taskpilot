import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle } from "lucide-react";
import {
  ERROR_MASCOT_EVENT,
  type ErrorMascotPayload,
} from "../lib/errorMascot";
import { ErrorMinion } from "./ErrorMinion";

const VISIBLE_MS = 7000;

export function ErrorMascotHost() {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function onErrorMascot(e: Event) {
      const detail = (e as CustomEvent<ErrorMascotPayload>).detail;
      setMessage(detail?.message || "Something went wrong");
      setOpen(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setOpen(false), VISIBLE_MS);
    }

    window.addEventListener(ERROR_MASCOT_EVENT, onErrorMascot);
    return () => {
      window.removeEventListener(ERROR_MASCOT_EVENT, onErrorMascot);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-[110] overflow-hidden"
    >
      <div
        className={`absolute bottom-6 right-6 flex max-w-[min(92vw,32rem)] items-end gap-3 transition-all duration-500 ease-out ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0"
        }`}
      >
        <ErrorMinion className="h-32 w-auto shrink-0 drop-shadow-xl" />
        <div className="relative mb-8 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-xl">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-red-600">
            <AlertCircle className="h-4 w-4" />
            Error
          </div>
          <p className="max-w-xs leading-5 text-zinc-700">{message}</p>
          <span
            aria-hidden
            className="absolute -left-2 bottom-5 h-4 w-4 rotate-45 rounded-sm border-b border-l border-red-200 bg-white"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
