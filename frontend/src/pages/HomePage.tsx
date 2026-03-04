
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Heart, MapPin, Mail,
  Stethoscope, FlaskConical, FileText, Lock, Shield,
  ChevronRight, Star, ExternalLink, Instagram, Phone,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-white py-20 lg:py-28 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-2 text-sm font-medium mb-7 text-sky-700">
                <Heart className="w-4 h-4 text-red-500 fill-red-400" />
                Family Medicine · Dubai, UAE
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-5 tracking-tight text-gray-900">
                Dr. Saria<br />
                <span className="text-sky-600">El Hachem</span>
              </h1>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-md">
                Dedicated to providing compassionate, comprehensive family healthcare
                for patients of all ages in Dubai. Your health, your family, our priority.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-sky-600 text-white rounded-xl px-6 py-3 font-semibold hover:bg-sky-700 active:bg-sky-800 transition-all duration-200 text-sm shadow-sm"
                >
                  Patient Portal
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href="#contact"
                  onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl px-6 py-3 font-semibold hover:bg-gray-50 transition-all duration-200 text-sm"
                >
                  Contact Us
                </a>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6 pt-8 border-t border-gray-100">
                <div>
                  <div className="text-2xl font-bold text-gray-900">10+</div>
                  <div className="text-xs text-gray-500 mt-0.5">Years Experience</div>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">5,000+</div>
                  <div className="text-xs text-gray-500 mt-0.5">Patients Served</div>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  DHA Licensed
                </div>
              </div>
            </div>

            {/* Right – doctor card */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md lg:max-w-lg">
                <div className="bg-gray-50 border border-gray-100 rounded-3xl p-11 shadow-sm">
                  <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
                    <div className="w-24 h-24 bg-sky-100 border-2 border-sky-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-12 h-12 text-sky-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">Dr. Saria El Hachem</div>
                      <div className="text-base text-sky-600 font-medium mt-1">Family Medicine</div>
                      <div className="text-sm text-gray-400 mt-1">Jumeirah American Clinic · Dubai</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: FileText,     label: 'Medical Records',   color: 'text-sky-600',     bg: 'bg-sky-50' },
                      { icon: FlaskConical, label: 'Lab & Blood Tests',  color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { icon: Shield,       label: 'Radiology & X-Rays', color: 'text-purple-600',  bg: 'bg-purple-50' },
                    ].map(({ icon: Icon, label, color, bg }) => (
                      <div key={label} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-5 py-4">
                        <div className={`w-11 h-11 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <span className="text-base font-medium text-gray-700 flex-1">{label}</span>
                        <Lock className="w-4 h-4 text-gray-300" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 pt-7 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-400">Secure · Private · Encrypted</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm text-emerald-600 font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Patient Portal CTA ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 lg:p-12 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-2 text-sm mb-6 text-sky-700 font-medium">
                  <Lock className="w-4 h-4" />
                  HIPAA-compliant · Encrypted · Private
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight text-gray-900">
                  Your Secure<br />Patient Portal
                </h2>
                <p className="text-gray-500 text-base leading-relaxed mb-8">
                  Access all your medical records, lab results & radiology from anywhere, securely.
                  Your data is encrypted and only visible to you and Dr. El Hachem's authorized team.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: FileText,     text: 'Medical Records',    color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'border-sky-200' },
                    { icon: FlaskConical, text: 'Lab & Blood Results', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                    { icon: Shield,       text: 'Radiology',           color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200' },
                    { icon: Lock,         text: 'Private & Encrypted', color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200' },
                  ].map(({ icon: Icon, text, color, bg, border }) => (
                    <div key={text} className={`flex items-center gap-3 bg-white border ${border} rounded-xl px-4 py-3`}>
                      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to="/register" className="bg-sky-600 text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-sky-700 transition-all duration-200 shadow-sm">
                    Register as Patient
                  </Link>
                  <Link to="/login" className="bg-white border border-gray-200 text-gray-700 rounded-xl px-6 py-3 font-semibold text-sm hover:bg-gray-50 transition-all duration-200">
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Right – privacy card */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[260px]">
                <div className="w-16 h-16 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-center mb-5">
                  <Lock className="w-8 h-8 text-sky-600" />
                </div>
                <div className="text-lg font-bold text-gray-900 mb-2">End-to-End Encrypted</div>
                <div className="text-sm text-gray-500 leading-relaxed mb-5 max-w-xs">
                  Your medical data is protected with 256-bit AES encryption. Only you and Dr. El Hachem's authorized team can access it.
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-emerald-700 font-semibold">Secure & Private</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-2 text-sm font-medium mb-5 text-sky-700">
              <MapPin className="w-4 h-4" />
              Dubai, UAE
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-900">Contact & Location</h2>
            <p className="text-gray-500 max-w-md mx-auto">We are here to help you. Reach out to us anytime.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 items-stretch">

            {/* Clinic Location */}
            <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold mb-3 text-base text-gray-900">Clinic Location</h3>
              <p className="text-sky-600 font-semibold text-sm mb-1">Jumeirah American Clinic</p>
              <p className="text-gray-500 text-sm mb-5">Al Wasl Branch · Dubai, UAE</p>
              <div className="mt-auto">
                <a
                  href="https://maps.google.com/?q=Jumeirah+American+Clinic+Al+Wasl+Dubai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-sky-600 border border-gray-200 hover:border-sky-200 rounded-lg px-3 py-2 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Get Directions
                </a>
              </div>
            </div>

            {/* Instagram */}
            <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br from-pink-500 to-purple-600">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-base text-gray-900">Follow on Instagram</h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Stay connected with Dr. Saria's latest health tips and updates
              </p>
              <div className="mt-auto">
                <a
                  href="https://www.instagram.com/drsariahachem/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @drsariahachem
                </a>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mb-5">
                <Mail className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="font-bold mb-5 text-base text-gray-900">Contact Information</h3>
              <div className="w-full space-y-4 mt-auto">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">Email</p>
                  <a href="mailto:saria.hachem@jac.ae" className="text-sky-600 text-sm font-medium hover:text-sky-800 transition-colors">
                    saria.hachem@jac.ae
                  </a>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">Phone</p>
                  <a href="tel:800522823" className="inline-flex items-center gap-1.5 text-sky-600 text-sm font-medium hover:text-sky-800 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                    800-522823
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Jumeirah American Clinic</p>
                </div>
              </div>
            </div>

          </div>

          {/* Review CTA */}
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center">
                  <Star className="w-7 h-7 text-amber-500 fill-amber-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-1 text-gray-900">Enjoyed your visit?</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Your feedback helps other patients find the care they need. Share your experience on Helium Doc.
                </p>
                <a
                  href="https://heliumdoc.com/uae/saria-el-hachem/?utm_source=sharebutton&utm_medium=twitter&utm_campaign=Saria%20El%20Hachem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 text-amber-800 rounded-xl px-6 py-2.5 font-semibold text-sm hover:bg-amber-200 transition-all duration-200"
                >
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  Leave a Review on Helium Doc
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sky-900 border border-sky-700 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-sky-400 fill-sky-500" />
              </div>
              <div>
                <span className="text-white font-semibold block text-sm">Dr. Saria El Hachem</span>
                <span className="text-gray-400 text-xs">Jumeirah American Clinic · Dubai, UAE</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} Dr. Saria El Hachem · Family Medicine · Dubai, UAE
              · All patient data is protected and confidential
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/drsariahachem/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-400 hover:text-pink-400 transition-colors text-xs"
              >
                <Instagram className="w-4 h-4" />
                <span>@drsariahachem</span>
              </a>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
