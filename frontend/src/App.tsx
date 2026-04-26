import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { AppShell } from "./components/AppShell";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import TaskList from "./pages/TaskList";
import TaskDetail from "./pages/TaskDetail";

function FullscreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center text-zinc-400">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullscreenLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullscreenLoader />;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
