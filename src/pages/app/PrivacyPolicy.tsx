import LegalContent, { type LegalSection } from "../../components/ui/LegalContent";

const sections: LegalSection[] = [
  {
    heading: "Information We Collect",
    body: "We may collect basic information such as your name, email, and work records (time logs and earnings) to provide the service.",
  },
  {
    heading: "How We Use Your Information",
    body: "Your data is used to manage your account, track your work records, and improve the app experience.",
  },
  {
    heading: "Data Storage",
    body: "Your data may be stored securely in local storage or on our servers. We take reasonable steps to protect your information.",
  },
  {
    heading: "Data Sharing",
    body: "We do not sell or share your personal data with third parties except when required by law.",
  },
  {
    heading: "Your Rights",
    body: "You can access, update, or delete your data anytime by using the app features or contacting us.",
  },
  {
    heading: "Changes to This Policy",
    body: "We may update this policy from time to time. Continued use of the app means you accept the changes.",
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalContent
      eyebrow="Legal"
      title="Privacy Policy"
      description="How TimeBud handles your information."
      intro="Your privacy is important to us. This Privacy Policy explains how TimeBud collects, uses, and protects your information."
      sections={sections}
    />
  );
}
