import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { AuthLayout } from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    navigate("/");
  }

  return (
    <AuthLayout>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-500">
          Sign in to continue to your workspace.
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

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full"
          rightIcon={!loading && <ArrowRight className="h-4 w-4" />}
        >
          {loading ? "Signing in" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-zinc-500">
          New to TaskPilot?{" "}
          <Link
            to="/signup"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
