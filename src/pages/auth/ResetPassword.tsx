import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { AuthCard, AuthLayout } from "../../components/layout/AuthLayout";
import { PasswordField } from "../../components/ui/FormField";
import { apiErrorMessage } from "../../lib/error";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/reset-password", {
        token,
        password,
        password_confirmation: confirmPassword,
      });

      setMessage(response.data.message);
      setTimeout(() => window.location.assign("/login"), 2000);
    } catch (error) {
      setMessage(apiErrorMessage(error, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        eyebrow="Account recovery"
        title="Reset your password"
        description="Choose a new password for your TimeBud account."
        footer={
          <Link
            to="/login"
            className="font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            ← Back to sign in
          </Link>
        }
      >
        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-primary"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            hint="At least 6 characters"
            required
          />
          <PasswordField
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
