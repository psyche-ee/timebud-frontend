import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import api from "../../api/axios";
import { AuthCard, AuthLayout } from "../../components/layout/AuthLayout";
import { PasswordField, TextField } from "../../components/ui/FormField";
import { apiErrorDetails } from "../../lib/error";

const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
  fName: "",
  lName: "",
  mName: "",
  dob: "",
  gender: "male",
  ratePerHr: "",
};

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof initialForm) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const nextStep = () => {
    if (!form.email || !form.password || !form.confirmPassword) {
      setError("Email and password fields are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/register", {
        email: form.email,
        password: form.password,
        confirm_password: form.confirmPassword,
        f_name: form.fName,
        l_name: form.lName,
        m_name: form.mName,
        dob: form.dob,
        gender: form.gender,
        rate_per_hr: form.ratePerHr || 0,
      });

      if (response.data.status === 1) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        window.location.assign("/dashboard");
      }
    } catch (error) {
      const details = apiErrorDetails(error);
      setError(details.length ? details.join(", ") : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        eyebrow={`Step ${step} of 2`}
        title={step === 1 ? "Create your account" : "Tell us about you"}
        description={
          step === 1
            ? "Start tracking your time in just a couple of minutes."
            : "Your details help us calculate accurate earnings."
        }
        footer={
          <>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Sign in
            </Link>
          </>
        }
      >
        <div className="mb-7 flex items-center gap-2" aria-label="Registration progress">
          {[1, 2].map((item) => (
            <div key={item} className="flex flex-1 items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  step >= item ? "bg-primary" : "bg-secondary"
                }`}
              />
              {item === 1 && (
                <span className="sr-only">
                  {step >= 2 ? "Account details complete" : "Account details in progress"}
                </span>
              )}
            </div>
          ))}
          <Check
            className={`h-4 w-4 ${step === 2 ? "text-primary" : "text-muted-foreground/40"}`}
            aria-hidden="true"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {step === 1 ? (
            <>
              <TextField
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
                required
              />
              <PasswordField
                label="Password"
                value={form.password}
                onChange={update("password")}
                autoComplete="new-password"
                hint="At least 6 characters"
                required
              />
              <PasswordField
                label="Confirm password"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.99]"
              >
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="First name"
                  placeholder="Juan"
                  value={form.fName}
                  onChange={update("fName")}
                  required
                />
                <TextField
                  label="Last name"
                  placeholder="Dela Cruz"
                  value={form.lName}
                  onChange={update("lName")}
                  required
                />
              </div>
              <TextField
                label="Middle name"
                placeholder="Optional"
                value={form.mName}
                onChange={update("mName")}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Date of birth"
                  type="date"
                  value={form.dob}
                  onChange={update("dob")}
                  max={new Date().toISOString().split("T")[0]}
                />
                <div>
                  <label
                    htmlFor="register-gender"
                    className="mb-1.5 block text-xs font-medium text-foreground"
                  >
                    Gender
                  </label>
                  <select
                    id="register-gender"
                    value={form.gender}
                    onChange={(event) => update("gender")(event.target.value)}
                    className="field-input"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <TextField
                label="Hourly rate (₱)"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.ratePerHr}
                onChange={update("ratePerHr")}
                hint="You can update this later in your profile."
              />

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(1);
                  }}
                  className="min-h-12 flex-1 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60"
                >
                  {loading ? "Creating…" : "Create account"}
                </button>
              </div>
            </>
          )}
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
