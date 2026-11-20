import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send } from "lucide-react";
import api from "../../api/axios";
import { AuthCard, AuthLayout } from "../../components/layout/AuthLayout";
import { TextField } from "../../components/ui/FormField";
import { apiErrorMessage } from "../../lib/error";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/forgot-password", { email });
      setMessage(response.data.message);
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
        title="Forgot your password?"
        description="Enter your email and we'll send you a link to reset it."
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
          <TextField
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            suffix={<Mail className="h-4 w-4" aria-hidden="true" />}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
            {!loading && <Send className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
