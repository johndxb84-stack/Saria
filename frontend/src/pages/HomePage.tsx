
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Heart, Award, MapPin, Phone, Mail, Clock, Shield,
  Stethoscope, Baby, Users, FlaskConical, FileText, Lock,
  ChevronRight, Star, GraduationCap, Briefcase
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
                <Heart className="w-4 h-4 text-red-300" />
                Family Medicine · Dubai, UAE
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Dr. Saria<br />
                <span className="text-primary-200">El Hachem</span>
              </h1>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Dedicated to providing compassionate, comprehensive family healthcare
                for patients of all ages in Dubai. Your health, your family, our priority.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg">
                  Access Patient Portal
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a href="#contact" className="inline-flex items-center gap-2 border-2 border-white/40 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  Book Appointment
                </a>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Stethoscope className="w-16 h-16 text-white" />
                    </div>
                    <div className="text-white text-lg font-bold">MD · Family Medicine</div>
                    <div className="text-primary-200 text-sm">Licensed in UAE</div>
                  </div>
                </div>
                {/* Stats bubbles */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-primary-700">15+</div>
                  <div className="text-xs text-gray-500">Years Experience</div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-primary-700">5000+</div>
                  <div className="text-xs text-gray-500">Patients Served</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                About <span className="text-primary-600">Dr. Saria El Hachem</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Dr. Saria El Hachem is a highly qualified Family Medicine physician with over 15 years
                of experience providing holistic, patient-centered care. Born with a passion for
                medicine and a deep commitment to family wellness, she has built her practice
                in Dubai as a trusted health partner for hundreds of families.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Her approach combines the latest evidence-based medicine with a warm, compassionate
                bedside manner. She believes that understanding the whole person — not just their
                symptoms — is the foundation of excellent medical care.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Fluent in Arabic, French, and English, Dr. El Hachem serves Dubai's diverse
                international community with cultural sensitivity and professional excellence.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Arabic', 'English', 'French'].map(lang => (
                  <span key={lang} className="badge-blue px-3 py-1 text-sm">{lang}</span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: GraduationCap, title: 'Medical Education', desc: 'Doctor of Medicine (MD) — Top of Class', color: 'bg-blue-50 text-blue-600' },
                { icon: Award, title: 'Board Certification', desc: 'Family Medicine Board Certified · DHA Licensed', color: 'bg-green-50 text-green-600' },
                { icon: Briefcase, title: 'Clinical Experience', desc: '15+ years in Family & Community Medicine', color: 'bg-purple-50 text-purple-600' },
                { icon: Star, title: 'Special Interests', desc: 'Preventive Care, Pediatrics, Women\'s Health, Chronic Disease Management', color: 'bg-yellow-50 text-yellow-600' },
                { icon: MapPin, title: 'Location', desc: 'Dubai, United Arab Emirates', color: 'bg-red-50 text-red-600' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{title}</div>
                    <div className="text-gray-600 text-sm">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Medical Services</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive family healthcare for every stage of life
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Stethoscope, title: 'General Consultations', desc: 'Comprehensive assessments, health checks, and management of acute and chronic conditions.', color: 'bg-primary-500' },
              { icon: Baby, title: 'Pediatric Care', desc: 'Expert care for infants, children, and adolescents including vaccinations and developmental monitoring.', color: 'bg-green-500' },
              { icon: Heart, title: 'Preventive Medicine', desc: 'Screenings, lifestyle counseling, and proactive strategies to maintain your long-term health.', color: 'bg-red-500' },
              { icon: FlaskConical, title: 'Diagnostics & Lab', desc: 'On-site blood work, urinalysis, and coordination with advanced imaging centers (X-ray, MRI, CT).', color: 'bg-purple-500' },
              { icon: Users, title: "Women's Health", desc: 'Gynecological exams, family planning, prenatal guidance, and menopause management.', color: 'bg-pink-500' },
              { icon: FileText, title: 'Chronic Disease Management', desc: 'Ongoing care for diabetes, hypertension, thyroid disorders, asthma, and other chronic conditions.', color: 'bg-yellow-500' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card hover:shadow-md transition-all group">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Portal CTA */}
      <section className="py-20 bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
                <Lock className="w-4 h-4" />
                HIPAA-compliant · Encrypted · Private
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Your Secure Patient Portal</h2>
              <p className="text-primary-100 text-lg leading-relaxed mb-8">
                Access all your medical records, lab results, X-rays, prescriptions, and health history
                from anywhere, securely. Your data is encrypted and only visible to you and Dr. El Hachem's
                authorized medical team.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: FileText, text: 'Medical Records' },
                  { icon: FlaskConical, text: 'Lab & Blood Results' },
                  { icon: Shield, text: 'X-rays & Scans' },
                  { icon: Lock, text: 'Private & Encrypted' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
                  Register as Patient
                </Link>
                <Link to="/login" className="border-2 border-white/40 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Consultation Notes', type: 'Consultation', date: 'Recent' },
                { title: 'Blood Panel CBC', type: 'Blood Test', date: 'Recent' },
                { title: 'Chest X-Ray', type: 'X-Ray', date: 'Recent' },
                { title: 'Prescription', type: 'Medication', date: 'Active' },
              ].map((item) => (
                <div key={item.title} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="text-xs text-primary-200 mt-1">{item.type}</div>
                  <div className="inline-block mt-2 text-xs bg-white/10 rounded-full px-2 py-0.5">{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact & Location</h2>
            <p className="text-gray-600 text-lg">We are here to help you. Reach out to us anytime.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Clinic Address',
                lines: ['Dubai, United Arab Emirates'],
                color: 'text-red-500 bg-red-50'
              },
              {
                icon: Phone,
                title: 'Phone & WhatsApp',
                lines: ['+971-XX-XXX-XXXX', 'WhatsApp available'],
                color: 'text-green-500 bg-green-50'
              },
              {
                icon: Mail,
                title: 'Email',
                lines: ['dr.saria@clinic.ae', 'For appointments & records'],
                color: 'text-blue-500 bg-blue-50'
              },
            ].map(({ icon: Icon, title, lines, color }) => (
              <div key={title} className="card text-center hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                {lines.map(line => (
                  <p key={line} className="text-gray-600 text-sm">{line}</p>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-12 card">
            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Clinic Hours</h3>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  {[
                    ['Monday – Thursday', '8:00 AM – 6:00 PM'],
                    ['Friday', '8:00 AM – 12:00 PM'],
                    ['Saturday', '9:00 AM – 3:00 PM'],
                    ['Sunday', 'Closed'],
                  ].map(([day, hours]) => (
                    <div key={day} className="flex justify-between gap-4">
                      <span className="font-medium text-gray-700">{day}</span>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">Dr. Saria El Hachem</span>
            </div>
            <p className="text-sm text-center">
              © {new Date().getFullYear()} Dr. Saria El Hachem · Family Medicine · Dubai, UAE
              · All patient data is protected and confidential
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Lock className="w-3 h-3" />
              <span>HIPAA Compliant Portal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
