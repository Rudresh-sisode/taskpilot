export const ERROR_MASCOT_EVENT = "taskpilot:error-mascot";

export interface ErrorMascotPayload {
  message: string;
}

export function notifyError(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ErrorMascotPayload>(ERROR_MASCOT_EVENT, {
      detail: { message },
    }),
  );
}
