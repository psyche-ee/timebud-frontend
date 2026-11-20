import LegalContent, { type LegalSection } from "../../components/ui/LegalContent";

const sections: LegalSection[] = [
  {
    heading: "Use of the App",
    body: "TimeBud is intended for personal and productivity use. You agree not to misuse the application or attempt unauthorized access.",
  },
  {
    heading: "User Responsibilities",
    body: "You are responsible for maintaining the accuracy of your data and keeping your account secure.",
  },
  {
    heading: "Data Accuracy",
    body: "TimeBud provides calculations based on your input. We are not responsible for incorrect earnings due to wrong data entries.",
  },
  {
    heading: "Service Availability",
    body: "We aim to keep the app available at all times, but we do not guarantee uninterrupted service.",
  },
  {
    heading: "Limitation of Liability",
    body: 'TimeBud is provided "as is" without warranties. We are not liable for any losses or damages resulting from the use of the app.',
  },
  {
    heading: "Changes to Terms",
    body: "We may update these terms at any time. Continued use of the app means you accept the updated terms.",
  },
];

export default function Terms() {
  return (
    <LegalContent
      eyebrow="Legal"
      title="Terms & Conditions"
      description="The guidelines for using TimeBud."
      intro="By using TimeBud, you agree to the following terms and conditions."
      sections={sections}
    />
  );
}
