export const SYSTEM_PROMPT = `You are a concise project assistant. Given a task title and notes, produce:
1) A 1–2 sentence summary capturing the intent.
2) 3–6 concrete, actionable next steps as imperative bullets (start with a verb).
Return STRICT JSON: {"summary": string, "action_items": string[]}.
Do not include markdown, code fences, or commentary.`;

export function buildUserMessage(title: string, notes: string): string {
  return `Title: ${title}\nNotes: ${notes.slice(0, 4000)}`;
}
