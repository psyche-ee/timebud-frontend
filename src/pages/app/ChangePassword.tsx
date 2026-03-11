import Header from "../../components/Header";
import { IoEyeOutline, IoEyeOffOutline, IoChevronBack } from "react-icons/io5";
import { useState } from "react";
import api from "../../api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
    const navigate = useNavigate();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.post("/change-password", {
        current_password: current,
        new_password: newPass,
        confirm_new_password: confirm,
      });

      if (res.data.status === 1) {
        toast.success(res.data.message);
        setCurrent("");
        setNewPass("");
        setConfirm("");
        navigate("/settings");
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <Header />

        <a href="/settings" className="text-secondary text-xl font-semibold flex items-center gap-1">
          <IoChevronBack />
        </a>

        <div className="bg-surface rounded-2xl shadow-md p-6 space-y-5">

          {/* Current Password */}
          <PasswordInput
            label="Current Password"
            value={current}
            onChange={setCurrent}
            show={showCurrent}
            setShow={setShowCurrent}
          />

          {/* New Password */}
          <PasswordInput
            label="New Password"
            value={newPass}
            onChange={setNewPass}
            show={showNew}
            setShow={setShowNew}
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password"
            value={confirm}
            onChange={setConfirm}
            show={showConfirm}
            setShow={setShowConfirm}
          />

          {/* Feedback */}
          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-hover transition disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            <a
              href="/settings"
              className="flex-1 text-center border border-gray-300 py-2.5 rounded-lg text-secondary"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Password Input Component
function PasswordInput({
  label,
  value,
  onChange,
  show,
  setShow,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  setShow: (val: boolean) => void;
}) {
  return (
    <div>
      <label className="text-sm text-muted">{label}</label>
      <div className="relative mt-2">
        <input
          type={show ? "text" : "password"}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-2.5 text-muted"
        >
          {show ? <IoEyeOffOutline /> : <IoEyeOutline />}
        </button>
      </div>
    </div>
  );
}