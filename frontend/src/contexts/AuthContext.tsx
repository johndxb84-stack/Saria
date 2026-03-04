import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FamilyMember } from '../types';
import api from '../utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  familyMembers: FamilyMember[];
  viewedPatientId: string | null;
  viewedMember: FamilyMember | null;
  switchProfile: (member: FamilyMember) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [viewedPatientId, setViewedPatientId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedFamily = localStorage.getItem('familyMembers');
    const storedViewed = localStorage.getItem('viewedPatientId');
    if (stored && storedToken) {
      const parsedUser = JSON.parse(stored) as User;
      setUser(parsedUser);
      setToken(storedToken);
      const members: FamilyMember[] = storedFamily ? JSON.parse(storedFamily) : [];
      setFamilyMembers(members);
      // Restore previously viewed profile, defaulting to own id
      setViewedPatientId(storedViewed || parsedUser.id);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser, familyMembers: members = [] } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('familyMembers', JSON.stringify(members));
    localStorage.setItem('viewedPatientId', newUser.id);
    setToken(newToken);
    setUser(newUser);
    setFamilyMembers(members);
    setViewedPatientId(newUser.id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('familyMembers');
    localStorage.removeItem('viewedPatientId');
    setToken(null);
    setUser(null);
    setFamilyMembers([]);
    setViewedPatientId(null);
  };

  const switchProfile = (member: FamilyMember) => {
    setViewedPatientId(member.id);
    localStorage.setItem('viewedPatientId', member.id);
  };

  const viewedMember = familyMembers.find(m => m.id === viewedPatientId) ?? null;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, familyMembers, viewedPatientId, viewedMember, switchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
