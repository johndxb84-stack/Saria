import { Link } from 'react-router-dom';
import { Heart, FileText } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <FileText className="w-4 h-4" />
            Patient Portal Agreement
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: March 2025</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By registering for and using the Dr. Saria El Hachem Patient Portal ("the Portal"), you agree to
              be bound by these Terms of Service. If you do not agree, please do not use the Portal.
            </p>
            <p className="mt-2">
              These terms are governed by the laws of the <strong>United Arab Emirates</strong>, including
              UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection and applicable
              Dubai Health Authority (DHA) regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Purpose of the Portal</h2>
            <p>
              The Portal is a <strong>private medical records management system</strong> operated exclusively
              for established patients of Dr. Saria El Hachem at Jumeirah American Clinic (JAC), Dubai, UAE.
            </p>
            <p className="mt-2">The Portal allows you to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>View your medical records, lab results, and radiology reports</li>
              <li>Access prescriptions and vaccination records</li>
              <li>Receive notifications when new records are added</li>
              <li>Manage your profile and account settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Not for Medical Emergencies</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <strong>Important:</strong> This portal is not a substitute for in-person medical care. In case of
              a medical emergency, call <strong>999</strong> (UAE Emergency Services) or go directly to the
              nearest hospital emergency department. Do not use this portal to communicate urgent medical concerns.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Eligibility</h2>
            <p>You may use this Portal if you:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Are a patient of Dr. Saria El Hachem at Jumeirah American Clinic</li>
              <li>Are at least 18 years old, or are a parent/legal guardian registering on behalf of a minor</li>
              <li>Provide accurate and truthful information during registration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Account Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>You are responsible for maintaining the confidentiality of your login credentials</li>
              <li>You must not share your account with any other person</li>
              <li>You must notify the clinic immediately if you suspect unauthorized access to your account</li>
              <li>You must provide accurate identity information (Emirates ID or passport number) during registration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Consent</h2>
            <p>By registering, you explicitly consent to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Dr. El Hachem and her authorized clinic staff accessing and managing your electronic health records</li>
              <li>Storage of your personal and medical data on secure servers in the UAE</li>
              <li>Receiving email notifications when new medical records are added to your profile</li>
              <li>Your access activity being logged for security and audit purposes</li>
            </ul>
            <p className="mt-2">
              You may withdraw consent by contacting the clinic. Note that withdrawal of consent may limit our
              ability to provide you with portal-based access to your medical records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Attempt to access other patients' records</li>
              <li>Share, publish, or distribute medical records without authorization</li>
              <li>Use the portal for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, hack, or compromise the security of the portal</li>
              <li>Provide false or misleading personal information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Medical Records Accuracy</h2>
            <p>
              Medical records displayed in this portal are entered by Dr. El Hachem and her authorized nursing
              staff. While every effort is made to ensure accuracy, you should discuss any concerns about your
              records directly with the clinic.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Account Deactivation</h2>
            <p>
              The clinic reserves the right to deactivate or suspend your account if there is evidence of misuse,
              fraudulent registration information, or violation of these terms.
            </p>
            <p className="mt-2">
              You may request account deletion at any time by contacting{' '}
              <a href="mailto:saria.hachem@jac.ae" className="text-sky-600 hover:underline">saria.hachem@jac.ae</a>.
              Note that underlying medical records must be retained for the legally required period under UAE regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p>
              The Portal is provided as a convenience tool for accessing your medical records. Dr. El Hachem
              and Jumeirah American Clinic are not liable for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Interruptions or unavailability of the Portal</li>
              <li>Any decisions made based solely on information viewed in the Portal without consulting your doctor</li>
              <li>Unauthorized access resulting from your failure to safeguard your login credentials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the United Arab Emirates. Any disputes shall be resolved
              under the jurisdiction of the Dubai Courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Contact</h2>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm">
              <p className="font-semibold text-gray-900">Dr. Saria El Hachem</p>
              <p className="text-gray-500">Jumeirah American Clinic — Al Wasl Branch, Dubai, UAE</p>
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
            <Link to="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-gray-700 transition-colors font-medium text-gray-600">Terms of Service</Link>
            <span>·</span>
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
