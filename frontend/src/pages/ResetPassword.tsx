import { useState, useMemo, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
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

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const score = useMemo(() => strength(password), [password]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (password.length < 6) {
      const message = "Password must be at least 6 characters.";
      setError(message);
      notifyError(message);
      return;
    }
    if (password !== confirmPassword) {
      const message = "Passwords do not match.";
      setError(message);
      notifyError(message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      notifyError(error.message);
      return;
    }

    setNotice("Password updated. Redirecting to sign in...");
    await supabase.auth.signOut();
    window.setTimeout(() => navigate("/login"), 1500);
  }

  return (
    <AuthLayout>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Set a new password
        </h1>
        <p className="text-sm text-zinc-500">
          Choose a strong password for your TaskPilot account.
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
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 animate-fade-in"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="space-y-2">
          <Input
            label="New password"
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

        <Input
          label="Confirm password"
          type={showPw ? "text" : "password"}
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Repeat new password"
          leftIcon={<Lock className="h-4 w-4" />}
        />

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full"
          rightIcon={!loading && <KeyRound className="h-4 w-4" />}
        >
          {loading ? "Updating password" : "Update password"}
        </Button>

        <p className="text-center text-sm text-zinc-500">
          Already updated?{" "}
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
