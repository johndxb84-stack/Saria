
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Heart, MapPin, Mail, Shield,
  Stethoscope, FlaskConical, FileText, Lock,
  ChevronRight, Star, ExternalLink, Instagram
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 glass-pill rounded-full px-4 py-2 text-sm font-medium mb-6">
                <Heart className="w-4 h-4 text-red-300" />
                Family Medicine · Dubai, UAE
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
                Dr. Saria<br />
                <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  El Hachem
                </span>
              </h1>
              <p className="text-lg text-white/65 mb-10 leading-relaxed max-w-md">
                Dedicated to providing compassionate, comprehensive family healthcare
                for patients of all ages in Dubai. Your health, your family, our priority.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 glass-pill rounded-2xl px-7 py-3.5 font-semibold hover:bg-white/20 transition-all duration-300 text-sm"
              >
                Access Patient Portal
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right – glass circle + stat bubbles */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-80 h-80 lg:w-96 lg:h-96">

                {/* Glow halo */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-600/30 blur-3xl scale-110" />

                {/* Main glass circle */}
                <div className="relative w-full h-full rounded-full glass flex items-center justify-center overflow-hidden">
                  {/* Specular top highlight */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/18 to-transparent rounded-t-full pointer-events-none" />
                  {/* Bottom rim */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent rounded-b-full pointer-events-none" />

                  <div className="text-center relative z-10 px-8">
                    <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-4">
                      <Stethoscope className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-white font-bold text-base">MD · Family Medicine</div>
                    <div className="text-white/55 text-sm mt-0.5">Licensed in UAE</div>
                  </div>
                </div>

                {/* Stat bubbles */}
                <div className="absolute -top-4 -left-8 glass-pill rounded-2xl px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-white">10+</div>
                  <div className="text-xs text-white/65">Years Experience</div>
                </div>
                <div className="absolute -bottom-4 -right-8 glass-pill rounded-2xl px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-white">5000+</div>
                  <div className="text-xs text-white/65">Patients Served</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Patient Portal CTA ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-8 lg:p-14 relative overflow-hidden">
            {/* Top specular line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
            {/* Subtle inner glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 glass-pill rounded-full px-4 py-2 text-sm mb-6">
                  <Lock className="w-4 h-4 text-cyan-300" />
                  HIPAA-compliant · Encrypted · Private
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  Your Secure<br />Patient Portal
                </h2>
                <p className="text-white/65 text-lg leading-relaxed mb-8">
                  Access all your medical records, Lab results & Radiology from anywhere, securely.
                  Your data is encrypted and only visible to you and Dr. El Hachem's authorized medical team.
                </p>

                {/* Feature pills */}
                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: FileText,    text: 'Medical Records',    color: 'text-blue-300' },
                    { icon: FlaskConical,text: 'Lab & Blood Results', color: 'text-green-300' },
                    { icon: Shield,      text: 'Radiology',           color: 'text-violet-300' },
                    { icon: Lock,        text: 'Private & Encrypted', color: 'text-cyan-300' },
                  ].map(({ icon: Icon, text, color }) => (
                    <div key={text} className="flex items-center gap-3 glass-pill rounded-xl px-4 py-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <span className="text-sm font-medium">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link to="/register" className="glass-pill rounded-2xl px-7 py-3 font-semibold text-sm hover:bg-white/22 transition-all duration-300">
                    Register as Patient
                  </Link>
                  <Link to="/login" className="border border-white/20 rounded-2xl px-7 py-3 font-semibold text-sm hover:bg-white/8 transition-all duration-300">
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Document preview cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Lab Results',  type: 'Blood Test',        icon: FlaskConical, color: 'text-green-300',  glow: 'bg-green-400/10' },
                  { title: 'Radiology',    type: 'X-Ray · MRI · Scan', icon: Shield,       color: 'text-violet-300', glow: 'bg-violet-400/10' },
                ].map((item) => (
                  <div key={item.title} className="glass-pill rounded-2xl p-5 relative overflow-hidden">
                    {/* Top specular */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                    {/* Inner glow */}
                    <div className={`absolute inset-0 ${item.glow} rounded-2xl pointer-events-none`} />

                    <div className="relative z-10">
                      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center mb-4">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="text-xs text-white/55 mt-1 leading-relaxed">{item.type}</div>
                      <div className="inline-block mt-3 text-xs glass rounded-full px-2.5 py-1">Recent</div>
                    </div>
                  </div>
                ))}

                {/* Encryption badge card */}
                <div className="col-span-2 glass-pill rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">End-to-End Encrypted</div>
                    <div className="text-xs text-white/55 mt-0.5">256-bit AES · Your data stays private</div>
                  </div>
                  <div className="ml-auto">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Contact & Location</h2>
            <p className="text-white/55">We are here to help you. Reach out to us anytime.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Clinic */}
            <div className="glass rounded-3xl p-7 text-center relative overflow-hidden group hover:bg-white/12 transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
              <div className="w-13 h-13 glass-pill rounded-2xl flex items-center justify-center mx-auto mb-5 w-12 h-12">
                <MapPin className="w-6 h-6 text-red-300" />
              </div>
              <h3 className="font-bold mb-3 text-base">Clinic Locations</h3>
              <p className="text-blue-300 font-semibold text-sm mb-1">Jumeirah American Clinic (JAC)</p>
              <p className="text-white/55 text-sm">Al Wasl Branch · Dubai, UAE</p>
            </div>

            {/* Instagram */}
            <div className="glass rounded-3xl p-7 text-center relative overflow-hidden hover:bg-white/12 transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/8 to-purple-600/8 rounded-3xl pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-pink-500/50 to-purple-600/50 border border-white/20 backdrop-blur-sm">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-base">Follow on Instagram</h3>
              <p className="text-white/55 text-sm mb-5">Stay connected with Dr. Saria's latest health tips and updates</p>
              <a
                href="https://www.instagram.com/drsariahachem/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/70 to-purple-600/70 backdrop-blur-sm border border-white/20 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Instagram className="w-3.5 h-3.5" />
                @drsariahachem
              </a>
            </div>

            {/* Email */}
            <div className="glass rounded-3xl p-7 text-center relative overflow-hidden hover:bg-white/12 transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
              <div className="w-12 h-12 glass-pill rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mail className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="font-bold mb-2 text-base">Email</h3>
              <a href="mailto:saria.hachem@jac.ae" className="text-blue-300 text-sm font-medium hover:text-blue-200 transition-colors">
                saria.hachem@jac.ae
              </a>
              <p className="text-white/45 text-xs mt-1">For appointments & records</p>
            </div>
          </div>

          {/* Review CTA */}
          <div className="mt-5 glass rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-yellow-400/12 blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left relative z-10">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 glass-pill rounded-2xl flex items-center justify-center">
                  <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-1">Enjoyed your visit?</h3>
                <p className="text-white/55 text-sm mb-4">
                  Your feedback helps other patients find the care they need. Share your experience on Helium Doc.
                </p>
                <a
                  href="https://heliumdoc.com/uae/saria-el-hachem/?utm_source=sharebutton&utm_medium=twitter&utm_campaign=Saria%20El%20Hachem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 glass-pill rounded-2xl px-6 py-3 font-semibold text-sm hover:bg-white/20 transition-all duration-300"
                >
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  Leave a Review on Helium Doc
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl px-6 py-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 glass-pill rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-300" />
                </div>
                <div>
                  <span className="text-white font-semibold block text-sm">Dr. Saria El Hachem</span>
                  <span className="text-white/45 text-xs">Jumeirah American Clinic · Dubai, UAE</span>
                </div>
              </div>
              <p className="text-xs text-white/35 text-center">
                © {new Date().getFullYear()} Dr. Saria El Hachem · Family Medicine · Dubai, UAE
                · All patient data is protected and confidential
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/drsariahachem/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/45 hover:text-pink-400 transition-colors text-xs"
                >
                  <Instagram className="w-4 h-4" />
                  <span>@drsariahachem</span>
                </a>
                <div className="flex items-center gap-1.5 text-xs text-white/45">
                  <Lock className="w-3 h-3" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
