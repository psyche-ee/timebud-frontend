import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import api from "../../api/axios";
import { AuthCard, AuthLayout } from "../../components/layout/AuthLayout";
import { PasswordField, TextField } from "../../components/ui/FormField";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // GoogleLogin renders a fixed-width iframe. Measure the available space so
  // it never spills outside the card on narrow phones.
  const googleSlotRef = useRef<HTMLDivElement>(null);
  const [googleWidth, setGoogleWidth] = useState(336);

  useEffect(() => {
    const element = googleSlotRef.current;
    if (!element) return;

    const updateWidth = () => {
      const available = Math.floor(element.clientWidth);
      if (available > 0) setGoogleWidth(Math.min(336, available));
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });

      if (response.data.status === 1) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const credential = credentialResponse.credential;
    if (!credential) return;

    setLoading(true);
    try {
      const response = await api.post("/auth/google", { credential });

      if (response.data.status === 1) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Google sign-in failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign-in was cancelled or could not complete.");
  };

  return (
    <AuthLayout>
      <AuthCard
        eyebrow="Welcome back"
        title="Sign in to TimeBud"
        description="Pick up where you left off and keep your day on track."
        footer={
          <>
            New to TimeBud?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Create an account
            </Link>
          </>
        }
      >
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <TextField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
          </form>

          <div className="mt-8 w-full">
            <span className="relative flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex-1 border-t" />
              Or continue with
              <span className="flex-1 border-t" />
            </span>

            <div ref={googleSlotRef} className="mt-6 w-full min-w-0 overflow-hidden">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="continue_with"
                shape="rectangular"
                size="large"
                theme="outline"
                width={googleWidth}
                logo_alignment="center"
              />
            </div>
          </div>
        </GoogleOAuthProvider>
      </AuthCard>
    </AuthLayout>
  );
}
