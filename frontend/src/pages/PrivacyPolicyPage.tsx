import { Link } from 'react-router-dom';
import { Heart, Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-100 border border-sky-200 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-gray-900 font-semibold text-sm">Dr. Saria El Hachem</span>
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-2 text-sm font-medium mb-5 text-sky-700">
            <Shield className="w-4 h-4" />
            UAE PDPL Compliant
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: March 2025</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Who We Are</h2>
            <p>
              This Privacy Policy applies to the patient portal operated by <strong>Dr. Saria El Hachem</strong>,
              Family Medicine physician at <strong>Jumeirah American Clinic (JAC) — Al Wasl Branch, Dubai, UAE</strong>.
            </p>
            <p className="mt-2">
              We are committed to protecting your personal and medical data in accordance with
              <strong> UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL)</strong> and
              applicable Dubai Health Authority (DHA) regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Data We Collect</h2>
            <p>When you register and use this portal, we collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li><strong>Identity data:</strong> Full name, date of birth, gender</li>
              <li><strong>Contact data:</strong> Email address, phone number, home address</li>
              <li><strong>Identification data:</strong> Emirates ID number or passport number</li>
              <li><strong>Medical data:</strong> Consultation notes, diagnoses, prescriptions, lab results, radiology reports, vaccination records, allergies, and surgical history</li>
              <li><strong>Emergency contact:</strong> Name and phone number of your emergency contact</li>
              <li><strong>Account data:</strong> Encrypted password, account activity, and login history</li>
              <li><strong>Audit data:</strong> Logs of who accessed your records, when, and from which IP address</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Data</h2>
            <p>Your data is used exclusively for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Providing and managing your medical care</li>
              <li>Maintaining your electronic health records</li>
              <li>Sending you notifications about new records added to your profile</li>
              <li>Verifying your identity for secure portal access</li>
              <li>Complying with UAE health authority requirements</li>
            </ul>
            <p className="mt-2">We <strong>do not</strong> sell, rent, or share your personal or medical data with third parties for commercial purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Storage & Residency</h2>
            <p>
              Your data is stored on servers hosted in the <strong>UAE (UAE North region)</strong>, in accordance with
              UAE Federal Law No. 2 of 2019 on the use of information and communication technology in health fields,
              and UAE PDPL requirements for data residency.
            </p>
            <p className="mt-2">
              <strong>Email notifications:</strong> When a new medical record is added to your profile, a brief
              notification (containing only the record title and date — no clinical details) is sent via an
              email delivery service. This involves minimal data leaving UAE servers for the sole purpose of
              delivering your notification.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>All data is encrypted in transit using TLS/HTTPS</li>
              <li>All data is encrypted at rest on our database servers</li>
              <li>Passwords are hashed using bcrypt (12 rounds) — we cannot read your password</li>
              <li>Access is controlled by role-based permissions (patient, nurse, doctor)</li>
              <li>Every access to a medical record is logged in an immutable audit trail</li>
              <li>Sessions expire automatically after 8 hours of inactivity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Who Can Access Your Data</h2>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><strong>You</strong> — full access to your own records</li>
              <li><strong>Dr. Saria El Hachem</strong> — full access as your treating physician</li>
              <li><strong>Authorized clinic nurses</strong> — access to view records and add new entries, under Dr. El Hachem's supervision</li>
            </ul>
            <p className="mt-2">No other party has access to your medical records without your explicit consent or a legal obligation under UAE law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights Under UAE PDPL</h2>
            <p>Under UAE Federal Decree-Law No. 45 of 2021, you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li><strong>Access</strong> — request a copy of your personal data we hold</li>
              <li><strong>Correction</strong> — request correction of inaccurate data</li>
              <li><strong>Deletion</strong> — request deletion of your data, subject to legal retention requirements</li>
              <li><strong>Objection</strong> — object to how your data is processed</li>
              <li><strong>Portability</strong> — receive your data in a structured, readable format</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:saria.hachem@jac.ae" className="text-sky-600 hover:underline">saria.hachem@jac.ae</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Data Retention</h2>
            <p>
              Medical records are retained for a minimum of <strong>10 years</strong> from the date of last treatment,
              as required by UAE Ministry of Health regulations. Account data is retained for the duration of the
              patient–doctor relationship and for the legally required period thereafter.
            </p>
            <p className="mt-2">
              You may request deletion of your account and non-medical personal data at any time by contacting the clinic.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Cookies & Sessions</h2>
            <p>
              This portal uses session tokens (stored locally in your browser) to keep you securely logged in.
              These tokens expire after 8 hours. We do not use advertising cookies or third-party tracking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Significant changes will be communicated
              to registered patients by email. Continued use of the portal after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact</h2>
            <p>For any privacy-related questions or requests:</p>
            <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm">
              <p className="font-semibold text-gray-900">Dr. Saria El Hachem</p>
              <p className="text-gray-500">Jumeirah American Clinic — Al Wasl Branch</p>
              <p className="text-gray-500">Dubai, UAE</p>
              <a href="mailto:saria.hachem@jac.ae" className="text-sky-600 hover:underline mt-1 block">saria.hachem@jac.ae</a>
              <a href="tel:800522823" className="text-sky-600 hover:underline">800-522823</a>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Dr. Saria El Hachem · Dubai, UAE</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link to="/privacy" className="hover:text-gray-700 transition-colors font-medium text-gray-600">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
