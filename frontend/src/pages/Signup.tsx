import { useEffect, useState, useMemo, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { AuthLayout } from "../components/AuthLayout";
import { MinionFight } from "../components/MinionFight";
import { notifyError } from "../lib/errorMascot";
import { cn } from "../lib/cn";

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABEL = ["", "Weak", "Okay", "Good", "Strong"];
const STRENGTH_COLOR = ["bg-zinc-200", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-emerald-500"];

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const navigate = useNavigate();

  const score = useMemo(() => strength(password), [password]);

  useEffect(() => {
    if (!confirmationPending) return;
    const timer = window.setTimeout(() => navigate("/login"), 5000);
    return () => window.clearTimeout(timer);
  }, [confirmationPending, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      notifyError(error.message);
      return;
    }
    setConfirmationPending(true);
  }

  if (confirmationPending) {
    return (
      <AuthLayout>
        <div className="animate-fade-in text-center">
          <div className="mx-auto mb-5 flex h-44 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-soft">
            <MinionFight className="h-40 w-full max-w-xs" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Confirm your mail
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            We sent a confirmation code to{" "}
            <span className="font-medium text-zinc-700">{email}</span>.
            <br />
            They always fight, don't worry about them.
          </p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-zinc-900 animate-[confirm-countdown_5s_linear_forwards]" />
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Redirecting to sign in...
          </p>
          <style>{`
            @keyframes confirm-countdown {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Create your account
        </h1>
        <p className="text-sm text-zinc-500">
          Free forever — no credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 animate-fade-in"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
          placeholder="you@company.com"
          leftIcon={<Mail className="h-4 w-4" />}
        />

        <div className="space-y-2">
          <Input
            label="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            leftIcon={<Lock className="h-4 w-4" />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="focus-ring rounded p-1 text-zinc-400 hover:text-zinc-600"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          {password && (
            <div className="space-y-1.5 animate-fade-in">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i <= score ? STRENGTH_COLOR[score] : "bg-zinc-200",
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-500">
                Password strength:{" "}
                <span className="font-medium text-zinc-700">
                  {STRENGTH_LABEL[score]}
                </span>
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full"
          rightIcon={!loading && <ArrowRight className="h-4 w-4" />}
        >
          {loading ? "Creating account" : "Create account"}
        </Button>

        <ul className="space-y-1.5 pt-2 text-xs text-zinc-500">
          <li className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            Unlimited tasks
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            AI summaries powered by Claude
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            Cancel anytime
          </li>
        </ul>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
