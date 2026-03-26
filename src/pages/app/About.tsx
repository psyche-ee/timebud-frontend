import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";
import Logo from "../../assets/logo.svg";

import packageJson from "../../../package.json";

import {
  IoInformationCircleOutline,
  IoRocketOutline,
  IoCodeSlashOutline,
  IoOpenOutline
} from "react-icons/io5";

export default function About() {
  const version = packageJson.version;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Header />

        <h1 className="text-xl font-semibold text-secondary">About</h1>

        {/* Hero */}
        <div className="bg-card border rounded-2xl p-5 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-3">
            <Logo />
          </div>

          <h2 className="text-lg font-semibold text-secondary">Time<span className="text-primary">Bud</span></h2>
          <p className="text-sm text-muted dark:text-gray-300 mt-1">
            Track your time. Manage your earnings. Stay productive.
          </p>
        </div>

        {/* About */}
        <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-secondary font-medium">
            <IoInformationCircleOutline className="text-primary" />
            About the App
          </div>

          <p className="text-sm text-muted dark:text-gray-300 leading-relaxed">
            TimeBud is a simple and efficient time tracking application designed
            to help you monitor your working hours and calculate your earnings
            with ease. Whether you're a student, freelancer, or employee,
            TimeBud helps you stay organized and productive every day.
          </p>
        </div>

        {/* Features */}
        <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-secondary font-medium">
            <IoRocketOutline className="text-primary" />
            Features
          </div>

          <ul className="text-sm text-muted dark:text-gray-300 space-y-2 list-disc pl-5">
            <li>Track daily time in and time out</li>
            <li>Automatically calculate earnings</li>
            <li>View records and history</li>
            <li>Export work records as image</li>
            <li>Works offline (PWA support)</li>
          </ul>
        </div>

        {/* Developer */}
        <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-secondary font-medium">
            <IoCodeSlashOutline className="text-primary" />
            Developer
          </div>

          <p className="text-sm text-muted dark:text-gray-300">
            Developed by{" "}
            <span className="font-medium text-secondary">
              Edward Belda
            </span>.
          </p>
        </div>

        {/* Links Section */}
        <div className="bg-card border rounded-2xl shadow-sm divide-y">
          
          {/* Privacy Policy */}
          <a
            href="/privacy-policy"
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-secondary">
              Privacy Policy
            </span>
            <IoOpenOutline className="text-muted" />
          </a>

          {/* Terms */}
          <a
            href="/terms"
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-secondary">
              Terms & Conditions
            </span>
            <IoOpenOutline className="text-muted" />
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/psyche-ee/timebud-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-secondary">
              GitHub Repository
            </span>
            <IoOpenOutline className="text-muted" />
          </a>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted pt-4">
          Version {version} • © {new Date().getFullYear()} TimeBud
        </div>
      </div>

      <BottomNav />
    </div>
  );
}