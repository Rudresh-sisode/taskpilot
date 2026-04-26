import type { ReactNode } from "react";
import { Sparkles, Zap, ListChecks } from "lucide-react";
import { Logo } from "./Logo";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI summaries that actually help",
    body: "Turn rambling notes into clear summaries and next steps — streamed token-by-token.",
  },
  {
    icon: ListChecks,
    title: "Stay on top of every task",
    body: "A focused list view, fast filters, and keyboard-friendly editing.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    body: "Optimistic updates, autosave, and zero-friction interactions.",
  },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: branding pane */}
      <aside className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(at 0% 0%, rgb(99 102 241 / 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgb(168 85 247 / 0.35) 0px, transparent 50%), radial-gradient(at 100% 100%, rgb(236 72 153 / 0.25) 0px, transparent 50%), radial-gradient(at 0% 100%, rgb(56 189 248 / 0.2) 0px, transparent 50%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <Logo className="[&>span]:text-white" />
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              Your tasks,
              <br />
              <span className="bg-gradient-to-r from-fuchsia-300 via-violet-200 to-sky-200 bg-clip-text text-transparent">
                supercharged with AI.
              </span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-zinc-300">
              TaskPilot turns scattered notes into focused next steps so you can
              actually ship.
            </p>
          </div>

          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs text-zinc-400">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-zinc-500">
          © {new Date().getFullYear()} TaskPilot. Built for productive humans.
        </p>
      </aside>

      {/* Right: form */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
