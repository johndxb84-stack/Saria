import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Heart, Menu, X, User, LogOut, LayoutDashboard,
  FileText, ChevronDown, Users, Shield
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'doctor' ? '/doctor' : user?.role === 'nurse' ? '/nurse' : '/patient';

  const isActive = (path: string) => location.pathname === path;

  const scrollToSection = (sectionId: string) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-primary-700">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-gray-900 leading-tight">Dr. Saria El Hachem</div>
              <div className="text-xs text-primary-600 font-medium">Family Medicine · Dubai</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${isActive('/') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              About
            </Link>
            <button onClick={() => scrollToSection('services')} className="px-3 py-2 text-sm rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              Services
            </button>
            <button onClick={() => scrollToSection('contact')} className="px-3 py-2 text-sm rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              Contact
            </button>

            {user ? (
              <div className="flex items-center gap-2 ml-4">
                <Link to={dashboardPath} className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${location.pathname.startsWith(dashboardPath) ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 text-xs font-bold">
                        {user.first_name[0]}{user.last_name[0]}
                      </span>
                    </div>
                    <span>{user.first_name}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-gray-500 capitalize flex items-center gap-1 mt-0.5">
                          {user.role === 'doctor' && <Shield className="w-3 h-3 text-primary-500" />}
                          {user.role}
                        </div>
                      </div>
                      <Link
                        to={`${dashboardPath}/profile`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      {user.role === 'patient' && (
                        <Link
                          to="/patient/records"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FileText className="w-4 h-4" />
                          My Records
                        </Link>
                      )}
                      {user.role === 'doctor' && (
                        <Link
                          to="/doctor/staff"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Users className="w-4 h-4" />
                          Manage Staff
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={() => { handleLogout(); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Patient Portal</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link to="/" className="block px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>About</Link>
          <button onClick={() => scrollToSection('services')} className="w-full text-left px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50">Services</button>
          <button onClick={() => scrollToSection('contact')} className="w-full text-left px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50">Contact</button>
          {user ? (
            <>
              <Link to={dashboardPath} className="block px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to={`${dashboardPath}/profile`} className="block px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="block px-3 py-2 text-sm rounded-lg bg-primary-600 text-white" onClick={() => setMobileOpen(false)}>Patient Portal</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
