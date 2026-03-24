import { useState } from "react";
import Logo from "../../assets/logo.svg";
import api from "../../api/axios";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { ModeToggle } from "../../components/mode-toggle";

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Calendar } from "../../components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

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
      <div className="absolute top-4 right-4"><ModeToggle /></div>
      {/* Logo */}
      <div className="mb-8 flex items-center gap-4">
        <img src={Logo} alt="Logo" />
        <div className="h-12 w-1 bg-primary"></div>
        <h1 className="text-3xl font-bold text-secondary">Time<span className="text-3xl text-primary">Bud</span></h1>
      </div>

      {/* Register Card */}
      <div className="w-[90%] max-w-md bg-card border shadow-md rounded-xl p-8">

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
                className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                  className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                className="w-full text-sm bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
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
                className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              <input
                type="text"
                name="lName"
                placeholder="Last Name"
                value={formData.lName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              <input
                type="text"
                name="mName"
                placeholder="Middle Name (optional)"
                value={formData.mName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              <Popover>
                <PopoverTrigger asChild >
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal px-4 py-2 h-auto",
                      !formData.dob && "text-gray-400 dark:text-zinc-500",
                      "bg-white border-gray-300 text-gray-900",
                      "dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dob ? (
                      format(new Date(formData.dob), "PPP")
                    ) : (
                      <span>Date of Birth</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                  <Calendar
                    mode="single"
                    selected={formData.dob ? new Date(formData.dob) : undefined}
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        dob: date ? date.toISOString().split("T")[0] : "",
                      })
                    }
                    disabled={(date) => date > new Date()} // optional (no future DOB)
                    initialFocus
                  />
                </PopoverContent>
              </Popover> 

              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger
                  className="w-full px-4 py-2 h-auto
                  bg-white border-gray-300 text-gray-900
                  dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>

                <SelectContent className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <input
                type="number"
                name="ratePerHr"
                placeholder="Rate per hour"
                value={formData.ratePerHr}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full text-sm border border-gray-300 py-2 rounded-lg"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="w-full text-sm bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
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