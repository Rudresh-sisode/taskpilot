import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { MinionBob } from "./MinionBob";
import { MinionBewildered, MinionRunner } from "./MinionMood";
import {
  CELEBRATION_EVENT,
  type CelebratePayload,
  type CelebrationVariant,
} from "../lib/celebration";

const PHRASES: Record<CelebrationVariant, string[]> = {
  done: [
    "Banana! Task done!",
    "Bee-do bee-do. Nailed it!",
    "Poopaye! One down!",
    "Tulaliloo ti amo. Great job!",
    "Whaaat?! You did it!",
    "Bello! Another win!",
  ],
  in_progress: [
    "Momentum is building. Keep going.",
    "Small steps count. Stay with it.",
    "You started. Now make the next move.",
    "Focus mode on. One clear step at a time.",
    "Progress beats perfect. Keep pushing.",
  ],
  cancelled: [
    "Plot twist. Clear the noise and choose the next best task.",
    "That one is parked. Your focus is still valuable.",
    "Not every task survives the plan. Move forward cleanly.",
    "Surprised? Maybe. Stuck? No. Pick the next priority.",
    "Task cancelled. Attention reclaimed.",
  ],
};

export function CelebrationHost() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [variant, setVariant] = useState<CelebrationVariant>("done");
  const [seed, setSeed] = useState(0); // re-mount confetti
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    function onCelebrate(e: Event) {
      const detail = (e as CustomEvent<CelebratePayload>).detail ?? {};
      const nextVariant = detail.variant ?? "done";
      const phrases = PHRASES[nextVariant];
      setVariant(nextVariant);
      setMessage(
        detail.message ?? phrases[Math.floor(Math.random() * phrases.length)],
      );
      setSeed((s) => s + 1);
      setOpen(true);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => setOpen(false), 3200);
    }
    window.addEventListener(CELEBRATION_EVENT, onCelebrate);
    return () => {
      window.removeEventListener(CELEBRATION_EVENT, onCelebrate);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {/* Confetti */}
      {open && variant === "done" && <Confetti key={seed} />}

      {/* Mascot + bubble */}
      <div
        className={`absolute bottom-6 right-6 flex items-end gap-3 transition-all duration-500 ease-out ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-8 opacity-0"
        }`}
      >
        {/* Speech bubble */}
        <div className="relative mb-10 max-w-[14rem] rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-xl ring-1 ring-zinc-200">
          <span className="bg-gradient-to-r from-brand-600 to-fuchsia-600 bg-clip-text text-transparent">
            {message}
          </span>
          <span
            aria-hidden
            className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 rounded-sm bg-white ring-1 ring-zinc-200"
            style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
          />
        </div>

        {variant === "done" ? (
          <MinionBob className="h-32 w-auto drop-shadow-xl" />
        ) : variant === "in_progress" ? (
          <MinionRunner className="h-32 w-auto drop-shadow-xl" />
        ) : (
          <MinionBewildered className="h-32 w-auto drop-shadow-xl" />
        )}
      </div>
    </div>,
    document.body,
  );
}

/* -------------------- Confetti -------------------- */

const COLORS = [
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#0ea5e9",
  "#fcd34d",
];

function Confetti() {
  // Generate particle list once per mount
  const particles = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.4,
        size: 6 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 200,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-20px] block"
          style={
            {
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            animation: `confetti-fall ${p.duration}s cubic-bezier(0.2, 0.8, 0.4, 1) ${p.delay}s forwards`,
            "--drift": `${p.drift}px`,
            "--rot": `${p.rotate}deg`,
          } as CSSProperties & { "--drift": string; "--rot": string }
          }
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--drift), 110vh, 0) rotate(var(--rot));
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="confetti-fall"] { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </div>
  );
}
