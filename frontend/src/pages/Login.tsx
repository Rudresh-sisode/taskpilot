import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { AuthLayout } from "../components/AuthLayout";
import { MinionBob } from "../components/MinionBob";
import { notifyError } from "../lib/errorMascot";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    if (resetMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        notifyError(error.message);
        return;
      }
      setNotice("Password reset link sent. Check your email to continue.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      notifyError(error.message);
      return;
    }
    navigate("/");
  }

  return (
    <AuthLayout>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {resetMode ? "Reset your password" : "Welcome back!"}
        </h1>
        <p className="text-sm text-zinc-500">
          {resetMode
            ? "Enter your email and we'll send you a secure reset link."
            : "Sign in to continue to your workspace."}
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

        {notice && (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-end justify-center gap-3">
              <MinionBob className="h-28 w-auto drop-shadow-lg" />
              <div className="relative mb-6 max-w-[12rem] rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-700 shadow-soft">
                Check your inbox. I found the reset link.
                <span
                  aria-hidden
                  className="absolute -left-1.5 bottom-3 h-3 w-3 rotate-45 border-b border-l border-emerald-200 bg-white"
                />
              </div>
            </div>
            <div
              role="status"
              className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
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

        {!resetMode && (
          <div className="space-y-1.5">
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
              placeholder="••••••••"
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
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNotice("");
                  setResetMode(true);
                }}
                className="focus-ring rounded text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full"
          rightIcon={
            !loading &&
            (resetMode ? (
              <KeyRound className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            ))
          }
        >
          {loading
            ? resetMode
              ? "Sending reset link"
              : "Signing in"
            : resetMode
              ? "Send reset link"
              : "Sign in"}
        </Button>

        {resetMode && (
          <p className="text-center text-sm text-zinc-500">
            Remembered it?{" "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setNotice("");
                setResetMode(false);
              }}
              className="font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              Back to sign in
            </button>
          </p>
        )}

        {!resetMode && (
          <p className="text-center text-sm text-zinc-500">
            New to TaskPilot?{" "}
            <Link
              to="/signup"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
