import { useEffect, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import Avatar from "../../components/ui/Avatar";
import { TextField } from "../../components/ui/FormField";
import { readUser, writeUser, type SessionUser } from "../../lib/auth";
import { apiErrorMessage } from "../../lib/error";

type ProfileForm = {
  f_name: string;
  m_name: string;
  l_name: string;
  email: string;
  dob: string;
  gender: string;
  rate_per_hr: string;
  overtime_threshold_hrs: string;
  overtime_rate_per_hr: string;
};

function initialProfile(): ProfileForm {
  const user = readUser();
  return {
    f_name: user.f_name || "",
    m_name: user.m_name || "",
    l_name: user.l_name || "",
    email: user.email || "",
    dob: user.dob || "",
    gender: user.gender || "male",
    rate_per_hr: String(user.rate_per_hr ?? ""),
    overtime_threshold_hrs: String(user.overtime_threshold_hrs ?? "8"),
    // A blank overtime rate means "use the regular rate for overtime too".
    overtime_rate_per_hr:
      Number(user.overtime_rate_per_hr) > 0
        ? String(user.overtime_rate_per_hr)
        : "",
  };
}

function profileFromServer(server: SessionUser): ProfileForm {
  return {
    f_name: server.f_name || "",
    m_name: server.m_name || "",
    l_name: server.l_name || "",
    email: server.email || "",
    dob: server.dob || "",
    gender: server.gender || "male",
    rate_per_hr: String(server.rate_per_hr ?? ""),
    overtime_threshold_hrs: String(server.overtime_threshold_hrs ?? "8"),
    overtime_rate_per_hr:
      Number(server.overtime_rate_per_hr) > 0
        ? String(server.overtime_rate_per_hr)
        : "",
  };
}

const invalidateEarningCaches = () => {
  ["dashboardCache", "earningsCache", "recordsCache"].forEach((key) =>
    localStorage.removeItem(key)
  );
};

// Blank overtime rate intentionally becomes 0 so the backend uses the
// regular rate for overtime hours. A blank threshold restores the 8h default.
function toPayload(form: ProfileForm) {
  return {
    ...form,
    rate_per_hr: form.rate_per_hr === "" ? 0 : Number(form.rate_per_hr),
    overtime_threshold_hrs:
      form.overtime_threshold_hrs === "" ? 8 : Number(form.overtime_threshold_hrs),
    overtime_rate_per_hr:
      form.overtime_rate_per_hr === "" ? 0 : Number(form.overtime_rate_per_hr),
  };
}

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>(initialProfile);

  // Older versions saved the rate only in localStorage. Migrate it to the API
  // once so existing hours earn income too.
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const response = await api.get("/profile");
        const server = (response.data?.data ?? {}) as SessionUser;
        const local = readUser();
        const localRate = Number(local.rate_per_hr) || 0;
        const serverRate = Number(server.rate_per_hr) || 0;

        let finalUser: SessionUser = server;
        if (serverRate === 0 && localRate > 0) {
          const saved = await api.put("/profile", {
            ...toPayload(initialProfile()),
            rate_per_hr: localRate,
          });
          finalUser = saved.data?.data ?? server;
          writeUser({ ...local, ...finalUser });
        } else if (Object.keys(server).length > 0) {
          writeUser({ ...local, ...server });
        }
        if (Object.keys(finalUser).length > 0) {
          setProfile(profileFromServer(finalUser));
        }
        invalidateEarningCaches();
      } catch {
        // Keep the locally cached profile if the API is unavailable.
      }
    };
    void syncProfile();
  }, []);

  const update = (key: keyof ProfileForm) => (value: string) =>
    setProfile((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put("/profile", toPayload(profile));
      const saved = (response.data?.data ?? {}) as SessionUser;
      writeUser({ ...readUser(), ...saved });
      if (Object.keys(saved).length > 0) setProfile(profileFromServer(saved));
      invalidateEarningCaches();
      setEditMode(false);
      toast.success("Profile updated. Your rates are now in effect.");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  };

  const fullName = [profile.f_name, profile.l_name].filter(Boolean).join(" ") || "Your profile";

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your personal details and hourly rate."
        backTo="/settings"
        backLabel="Back to settings"
        actions={
          !editMode ? (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.98]"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit profile
            </button>
          ) : undefined
        }
      />

      <SectionCard className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center border-b border-border px-4 py-7 text-center sm:flex-row sm:gap-5 sm:px-6 sm:text-left">
          <Avatar user={profile} size="lg" />
          <div className="mt-4 sm:mt-0">
            <p className="text-lg font-bold text-foreground">{fullName}</p>
            <p className="text-sm text-muted-foreground">{profile.email || "No email"}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Changes are saved to your account and update your earnings.
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
          <TextField
            label="First name"
            value={profile.f_name}
            onChange={update("f_name")}
            disabled={!editMode}
            placeholder="First name"
          />
          <TextField
            label="Last name"
            value={profile.l_name}
            onChange={update("l_name")}
            disabled={!editMode}
            placeholder="Last name"
          />
          <TextField
            label="Middle name"
            value={profile.m_name}
            onChange={update("m_name")}
            disabled={!editMode}
            placeholder="Optional"
          />
          <TextField
            label="Email address"
            type="email"
            value={profile.email}
            onChange={update("email")}
            disabled={!editMode}
            placeholder="you@example.com"
          />
          <TextField
            label="Date of birth"
            type="date"
            value={profile.dob}
            onChange={update("dob")}
            disabled={!editMode}
          />
          <div>
            <label
              htmlFor="profile-gender"
              className="mb-1.5 block text-xs font-medium text-foreground"
            >
              Gender
            </label>
            <select
              id="profile-gender"
              value={profile.gender}
              onChange={(event) => update("gender")(event.target.value)}
              disabled={!editMode}
              className="field-input"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <TextField
            label="Hourly rate (₱)"
            type="number"
            min="0"
            step="0.01"
            value={profile.rate_per_hr}
            onChange={update("rate_per_hr")}
            disabled={!editMode}
            placeholder="0.00"
            hint="Regular pay rate for all worked hours."
          />
          <TextField
            label="Overtime threshold (hrs/day)"
            type="number"
            min="0"
            step="0.25"
            value={profile.overtime_threshold_hrs}
            onChange={update("overtime_threshold_hrs")}
            disabled={!editMode}
            placeholder="8"
            hint="Hours beyond this in a single shift count as overtime."
          />
          <TextField
            label="Overtime rate (₱)"
            type="number"
            min="0"
            step="0.01"
            value={profile.overtime_rate_per_hr}
            onChange={update("overtime_rate_per_hr")}
            disabled={!editMode}
            placeholder="Uses regular rate"
            hint="Leave blank to pay overtime at your regular hourly rate."
          />
        </div>

        {editMode && (
          <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </SectionCard>
    </>
  );
}
