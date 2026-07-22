/**
 * Purpose: App-wide authenticated user state — consumed by UserMenu, ProtectedRoute
 * Responsibilities: Expose current user, login/logout actions. Currently seeded with a mock
 *                    user (matches wireframe's "Ajith Kumar / Admin") since no auth API exists
 *                    yet — swap the seed + logout stub for real authService calls once the
 *                    backend is wired up. Never invent auth business logic beyond this stub.
 * Dependencies: react
 * Export: AuthProvider, useAuth()
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// TODO: replace with real session lookup once authService/API is connected
const MOCK_USER: AuthUser = {
  id: 'usr_001',
  name: 'Ajith Kumar',
  role: 'Admin',
  email: 'ajith@shinecrafttech.com',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(MOCK_USER);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    login: (nextUser) => setUser(nextUser),
    logout: () => setUser(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
