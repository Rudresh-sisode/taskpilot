export const CELEBRATION_EVENT = "taskpilot:celebrate";

export type CelebrationVariant = "done" | "in_progress" | "cancelled";

export interface CelebratePayload {
  message?: string;
  variant?: CelebrationVariant;
}

export function celebrate(payload: CelebratePayload = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CelebratePayload>(CELEBRATION_EVENT, { detail: payload }),
  );
}

export function celebrateStatus(variant: CelebrationVariant) {
  celebrate({ variant });
}
