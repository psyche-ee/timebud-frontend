import { useState } from "react";
import Logo from "../../assets/logo.svg";
import api from "../../api/axios";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export default function Register() {

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fName: "",
    lName: "",
    mName: "",
    dob: "",
    gender: "male",
    ratePerHr: ""
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Email and password fields are required.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post("/register", {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        f_name: formData.fName,
        l_name: formData.lName,
        m_name: formData.mName,
        dob: formData.dob,
        gender: formData.gender,
        rate_per_hr: formData.ratePerHr || 0
      });

      if (res.data.status === 1) {

        const token = res.data.data.token;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(res.data.data));

        window.location.href = "/dashboard";
      }

    } catch (err: any) {

      if (err.response?.data?.data) {
        setError(err.response.data.data.join(", "));
      } else {
        setError("Registration failed.");
      }

    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">

      {/* Logo */}
      <div className="mb-8 flex items-center gap-4">
        <img src={Logo} alt="Logo" />
        <div className="h-12 w-1 bg-primary"></div>
        <h1 className="text-3xl font-bold text-black">Time<span className="text-3xl text-primary">Bud</span></h1>
      </div>

      {/* Register Card */}
      <div className="w-[90%] max-w-md bg-surface shadow-md rounded-xl p-8">

        <h2 className="text-2xl font-semibold text-secondary mb-6 text-center">
          Register
        </h2>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          <div className={`h-2 flex-1 rounded ${step >= 1 ? "bg-primary" : "bg-gray-300"}`}></div>
          <div className={`h-2 flex-1 rounded ${step >= 2 ? "bg-primary" : "bg-gray-300"}`}></div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-[#D9D9D9] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-[#D9D9D9] rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-[#D9D9D9] rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                </button>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
              >
                Next
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input
                type="text"
                name="fName"
                placeholder="First Name"
                value={formData.fName}
                onChange={handleChange}
                className="w-full border border-[#D9D9D9] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                type="text"
                name="lName"
                placeholder="Last Name"
                value={formData.lName}
                onChange={handleChange}
                className="w-full border border-[#D9D9D9] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                type="text"
                name="mName"
                placeholder="Middle Name (optional)"
                value={formData.mName}
                onChange={handleChange}
                className="w-full border border-[#D9D9D9] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full border border-[#D9D9D9] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-[#D9D9D9] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                type="number"
                name="ratePerHr"
                placeholder="Rate per hour"
                value={formData.ratePerHr}
                onChange={handleChange}
                className="w-full border border-[#D9D9D9] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full border border-gray-300 py-2 rounded-lg"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Register
                </button>

              </div>
            </>
          )}

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-primary font-medium hover:underline">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}