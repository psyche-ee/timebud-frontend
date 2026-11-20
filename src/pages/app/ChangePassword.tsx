import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import { PasswordField } from "../../components/ui/FormField";
import { apiErrorMessage } from "../../lib/error";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newPass.length < 6) {
      toast.warning("New password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirm) {
      toast.warning("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/change-password", {
        current_password: current,
        new_password: newPass,
        confirm_new_password: confirm,
      });

      if (response.data.status === 1) {
        toast.success(response.data.message);
        setCurrent("");
        setNewPass("");
        setConfirm("");
        navigate("/settings");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, "Failed to change password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Change password"
        description="Use a strong password you haven't used elsewhere."
        backTo="/settings"
        backLabel="Back to settings"
      />

      <SectionCard className="mx-auto max-w-xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-5 sm:px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Update your password</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              You'll stay signed in on this device.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
          <PasswordField
            label="Current password"
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
            required
          />
          <PasswordField
            label="New password"
            value={newPass}
            onChange={setNewPass}
            autoComplete="new-password"
            hint="At least 6 characters"
            required
          />
          <PasswordField
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            required
          />

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="min-h-11 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </SectionCard>
    </>
  );
}
