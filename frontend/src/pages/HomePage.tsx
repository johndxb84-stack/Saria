
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Heart, Award, MapPin, Phone, Mail, Clock, Shield,
  Stethoscope, Users, FlaskConical, FileText, Lock,
  ChevronRight, Star, GraduationCap, Briefcase,
  Brain, Activity, ExternalLink, Instagram, CalendarCheck
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
              { icon: Heart, title: 'Preventive Medicine & Immunizations', desc: 'Screenings, adult immunizations, lifestyle counseling, and proactive strategies for long-term health.', color: 'bg-red-500' },
              { icon: Activity, title: 'Eating Disorders', desc: 'Multidisciplinary diagnosis and treatment of eating disorders using evidence-based CBT-E therapy.', color: 'bg-teal-500' },
              { icon: Brain, title: 'Mental Health', desc: 'Expert management of mental health conditions with compassionate, personalized care plans.', color: 'bg-indigo-500' },
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
            <div className="card text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 text-red-500 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Clinic Locations</h3>
              <p className="text-primary-600 font-semibold text-sm mb-1">Jumeirah American Clinic (JAC)</p>
              <p className="text-gray-600 text-sm mb-3">Al Wasl Branch · Dubai, UAE</p>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-gray-600 text-sm">Suite 11B, The Village Mall</p>
                <p className="text-gray-600 text-sm">Jumeirah Road, Dubai</p>
              </div>
            </div>
            <div className="card text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Follow on Instagram</h3>
              <p className="text-gray-600 text-sm mb-4">Stay connected with Dr. Saria's latest health tips and updates</p>
              <a
                href="https://www.instagram.com/drsariahachem/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Instagram className="w-3.5 h-3.5" />
                @drsariahachem
              </a>
            </div>
            <div className="card text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 text-blue-500 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email</h3>
              <a href="mailto:saria.hachem@jac.ae" className="text-primary-600 text-sm font-medium hover:underline">saria.hachem@jac.ae</a>
              <p className="text-gray-500 text-xs mt-1">For appointments & records</p>
            </div>
          </div>
          <div className="mt-8 card">
            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="w-full">
                <h3 className="font-bold text-gray-900 mb-3">Clinic Hours — Jumeirah American Clinic</h3>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  {[
                    ['Monday – Thursday', '9:00 AM – 7:00 PM'],
                    ['Friday – Saturday', '9:00 AM – 6:00 PM'],
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

          {/* Review CTA */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-xl mb-1">Enjoyed your visit?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Your feedback helps other patients find the care they need. Share your experience on Helium Doc.
                </p>
                <a
                  href="https://heliumdoc.com/uae/saria-el-hachem/?utm_source=sharebutton&utm_medium=twitter&utm_campaign=Saria%20El%20Hachem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors shadow-sm"
                >
                  <Star className="w-4 h-4 fill-white" />
                  Leave a Review on Helium Doc
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-white font-semibold block">Dr. Saria El Hachem</span>
                <span className="text-gray-500 text-xs">Jumeirah American Clinic · Dubai, UAE</span>
              </div>
            </div>
            <p className="text-xs text-center">
              © {new Date().getFullYear()} Dr. Saria El Hachem · Family Medicine · Dubai, UAE
              · All patient data is protected and confidential
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/drsariahachem/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-400 hover:text-pink-400 transition-colors text-xs"
                title="Follow on Instagram"
              >
                <Instagram className="w-4 h-4" />
                <span>@drsariahachem</span>
              </a>
              <div className="flex items-center gap-1.5 text-xs">
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
