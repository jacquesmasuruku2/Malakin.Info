'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  password: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisateurs définis directement pour éviter les problèmes de chargement asynchrone
const DEFAULT_USERS: User[] = [
  {
    email: 'jacquesmasuruku2@gmail.com',
    password: '678900',
    name: 'Jacques Masuruku'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);

  useEffect(() => {
    // Check if user is authenticated on mount (client-side only)
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('admin-auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }

      // Try to load users from config file, but keep defaults as fallback
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/admin-users.json');
      if (response.ok) {
        const data = await response.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Failed to load admin users, using defaults:', error);
      // Keep default users
    }
  };

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      try {
        localStorage.setItem('admin-auth', 'true');
        localStorage.setItem('admin-user', JSON.stringify(user));
        setIsAuthenticated(true);
        return true;
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        // Fallback: set authentication state directly
        setIsAuthenticated(true);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    try {
      localStorage.removeItem('admin-auth');
      localStorage.removeItem('admin-user');
      localStorage.removeItem('redirect-after-login');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
