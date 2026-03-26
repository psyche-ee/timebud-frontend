import BottomNav from "../../components/BottomNav";
import Header from "../../components/Header";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Header />

        <h1 className="text-xl font-semibold text-secondary">
          Terms & Conditions
        </h1>

        <div className="bg-card border rounded-2xl p-4 space-y-4 text-sm text-muted leading-relaxed">

          <p>
            By using TimeBud, you agree to the following terms and conditions.
          </p>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              Use of the App
            </h2>
            <p>
              TimeBud is intended for personal and productivity use. You agree
              not to misuse the application or attempt unauthorized access.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              User Responsibilities
            </h2>
            <p>
              You are responsible for maintaining the accuracy of your data
              and keeping your account secure.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              Data Accuracy
            </h2>
            <p>
              TimeBud provides calculations based on your input. We are not
              responsible for incorrect earnings due to wrong data entries.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              Service Availability
            </h2>
            <p>
              We aim to keep the app available at all times, but we do not
              guarantee uninterrupted service.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              Limitation of Liability
            </h2>
            <p>
              TimeBud is provided "as is" without warranties. We are not liable
              for any losses or damages resulting from the use of the app.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-secondary mb-1">
              Changes to Terms
            </h2>
            <p>
              We may update these terms at any time. Continued use of the app
              means you accept the updated terms.
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