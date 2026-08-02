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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Check if user is authenticated on mount
    const auth = localStorage.getItem('admin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    // Load users from config file
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/admin-users.json');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        // Fallback to default user if file doesn't exist
        setUsers([
          {
            email: 'jacquesmasuruku2@gmail.com',
            password: '678900',
            name: 'Jacques Masuruku'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load admin users:', error);
      // Fallback to default user
      setUsers([
        {
          email: 'jacquesmasuruku2@gmail.com',
          password: '678900',
          name: 'Jacques Masuruku'
        }
      ]);
    }
  };

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('admin-auth', 'true');
      localStorage.setItem('admin-user', JSON.stringify(user));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('admin-auth');
    localStorage.removeItem('admin-user');
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
