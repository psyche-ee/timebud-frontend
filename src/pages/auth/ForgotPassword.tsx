import { useState } from "react";
import Logo from "../../assets/logo.svg";
import api from "../../api/axios";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    try {
      const res = await api.post("/forgot-password", {
        email: email
      });

      setMessage(res.data.message);

    } catch (err:any) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">

      <div className="mb-8 flex items-center gap-4">
        <img src={Logo} alt="Logo" />
      </div>

      <div className="w-[80%] max-w-md bg-surface shadow-md rounded-xl p-8">

        <h2 className="text-2xl font-semibold text-secondary mb-4 text-center">
          Forgot Password
        </h2>

        {message && (
          <p className="text-sm text-center mb-4 text-primary">
            {message}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full border border-[#D9D9D9] rounded-lg px-4 py-2"
          />

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg"
          >
            Send Reset Link
          </button>

        </form>
        <h2 className="text-sm text-gray-500 mt-4 text-center">
          <a href="/login" className="">Remember password? <span className="text-primary">Login</span></a>
        </h2>
      </div>
    </div>
  );
}