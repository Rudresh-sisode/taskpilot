import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { MinionFight } from "../components/MinionFight";
import { MinionRunner, MinionBewildered } from "../components/MinionMood";

interface NotFoundProps {
  message?: string;
}

export default function NotFound({ message = "Not found" }: NotFoundProps) {
  return (
    <div className="flex min-h-full items-center justify-center overflow-y-auto px-4 py-10 sm:px-6">
      <section className="relative w-full max-w-3xl text-center">
        <div className="absolute inset-x-0 top-12 -z-10 mx-auto h-60 max-w-2xl rounded-full bg-white/45 blur-3xl" />

        <div className="mx-auto mb-7 grid max-w-2xl grid-cols-3 items-end gap-2 sm:gap-4">
          <MinionBewildered className="h-32 justify-self-end sm:h-40" />
          <MinionFight className="h-36 w-full sm:h-44" />
          <MinionRunner className="h-32 justify-self-start sm:h-40" />
        </div>

        <div className="mx-auto max-w-xl rounded-2xl border border-white/70 bg-white/82 px-6 py-7 shadow-soft backdrop-blur-xl">
          <span className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <Search className="h-5 w-5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
            404
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            {message}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
            The search party looked everywhere, but this task or page is not
            available anymore.
          </p>
          <Link
            to="/"
            className="focus-ring mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-soft transition-all duration-150 hover:bg-zinc-800 active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tasks
          </Link>
        </div>
      </section>
    </div>
  );
}
