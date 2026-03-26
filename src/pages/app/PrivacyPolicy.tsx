import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Header />

        <h1 className="text-xl font-semibold text-secondary">
          Privacy Policy
        </h1>

        <div className="bg-card border rounded-2xl p-4 space-y-4 text-sm text-muted leading-relaxed">

          <p>
            Your privacy is important to us. This Privacy Policy explains how
            TimeBud collects, uses, and protects your information.
          </p>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              Information We Collect
            </h2>
            <p>
              We may collect basic information such as your name, email,
              and work records (time logs and earnings) to provide the service.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              How We Use Your Information
            </h2>
            <p>
              Your data is used to manage your account, track your work
              records, and improve the app experience.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              Data Storage
            </h2>
            <p>
              Your data may be stored securely in local storage or on our
              servers. We take reasonable steps to protect your information.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              Data Sharing
            </h2>
            <p>
              We do not sell or share your personal data with third parties
              except when required by law.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              Your Rights
            </h2>
            <p>
              You can access, update, or delete your data anytime by using
              the app features or contacting us.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              Changes to This Policy
            </h2>
            <p>
              We may update this policy from time to time. Continued use of
              the app means you accept the changes.
            </p>
          </div>

        </div>

        <p className="text-xs text-center text-muted">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <BottomNav />
    </div>
  );
}