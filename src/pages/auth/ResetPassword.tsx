import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import api from "../../api/axios";

export default function ResetPassword() {

  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    try {

      const res = await api.post("/reset-password", {
        token: token,
        password: password,
        password_confirmation: confirmPassword
      });

      setMessage(res.data.message);
      setTimeout(() => {window.location.href = "/login"; }, 2000);

    } catch (err:any) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">

      {/* Logo */}
      <div className="mb-8 flex items-center gap-4">
        <img src={Logo} alt="Logo"/>
      </div>

      <div className="w-[80%] max-w-md bg-surface shadow-md rounded-xl p-8">

        <h2 className="text-2xl font-semibold text-center mb-6">
          Reset Password
        </h2>

        {message && (
          <p className="text-center text-sm mb-4 text-primary">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg"
          >
            Reset Password
          </button>

        </form>

      </div>
    </div>
  );
}