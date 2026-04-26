import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { cn } from "../lib/cn";

export function AppShell({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const email = session?.user?.email ?? "";
  const initial = (email[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="focus-ring rounded-md">
            <Logo />
          </Link>

          {session && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-sm shadow-soft transition hover:bg-zinc-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs font-semibold text-white">
                  {initial}
                </span>
                <span className="hidden text-zinc-700 sm:inline">{email}</span>
              </button>

              <div
                className={cn(
                  "absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg transition-all",
                  menuOpen
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-95 opacity-0",
                )}
              >
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <UserIcon className="h-4 w-4 text-zinc-400" />
                  <span className="truncate text-xs text-zinc-600">{email}</span>
                </div>
                <div className="my-1 h-px bg-zinc-100" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  leftIcon={<LogOut className="h-3.5 w-3.5" />}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    supabase.auth.signOut();
                  }}
                >
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
