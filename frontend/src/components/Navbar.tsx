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

  const scrollToContact = () => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const linkCls = (active: boolean) =>
    `px-3 py-2 text-sm rounded-lg font-medium transition-colors ${active ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/12'}`;

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold">
            <div className="w-9 h-9 glass-pill rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-white leading-tight">Dr. Saria El Hachem</div>
              <div className="text-xs text-white/60 font-medium">Family Medicine · Dubai</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={linkCls(isActive('/'))}>About</Link>
            <button onClick={scrollToContact} className={linkCls(false)}>Contact</button>

            {user ? (
              <div className="flex items-center gap-2 ml-4">
                <Link to={dashboardPath} className={linkCls(location.pathname.startsWith(dashboardPath))}>
                  <span className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </span>
                </Link>

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium text-white/80 hover:text-white hover:bg-white/12 transition-colors"
                  >
                    <div className="w-7 h-7 glass-pill rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.first_name[0]}{user.last_name[0]}
                      </span>
                    </div>
                    <span>{user.first_name}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-1 w-52 glass rounded-xl py-1 z-50">
                      {/* Top specular */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-t-xl pointer-events-none" />

                      <div className="px-4 py-2.5 border-b border-white/10">
                        <div className="text-sm font-semibold text-white">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-white/55 capitalize flex items-center gap-1 mt-0.5">
                          {user.role === 'doctor' && <Shield className="w-3 h-3 text-sky-300" />}
                          {user.role}
                        </div>
                      </div>
                      <Link
                        to={`${dashboardPath}/profile`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      {user.role === 'patient' && (
                        <Link
                          to="/patient/records"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FileText className="w-4 h-4" />
                          My Records
                        </Link>
                      )}
                      {user.role === 'doctor' && (
                        <Link
                          to="/doctor/staff"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Users className="w-4 h-4" />
                          Manage Staff
                        </Link>
                      )}
                      <div className="border-t border-white/10 mt-1">
                        <button
                          onClick={() => { handleLogout(); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10 hover:text-red-200 transition-colors"
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
                <Link to="/login" className="glass-pill px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/25 transition-all duration-200">
                  Sign In
                </Link>
                <Link to="/register" className="glass-pill px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/25 transition-all duration-200">
                  Patient Portal
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/12 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-nav border-t border-white/12 px-4 py-3 space-y-1">
          <Link to="/" className="block px-3 py-2 text-sm rounded-lg text-white/80 hover:bg-white/12 hover:text-white" onClick={() => setMobileOpen(false)}>About</Link>
          <button onClick={scrollToContact} className="w-full text-left px-3 py-2 text-sm rounded-lg text-white/80 hover:bg-white/12 hover:text-white">Contact</button>
          {user ? (
            <>
              <Link to={dashboardPath} className="block px-3 py-2 text-sm rounded-lg text-white/80 hover:bg-white/12 hover:text-white" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to={`${dashboardPath}/profile`} className="block px-3 py-2 text-sm rounded-lg text-white/80 hover:bg-white/12 hover:text-white" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg text-red-300 hover:bg-red-400/10">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 text-sm rounded-lg text-white/80 hover:bg-white/12 hover:text-white" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="block px-3 py-2 text-sm rounded-lg glass-pill text-white font-medium" onClick={() => setMobileOpen(false)}>Patient Portal</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
