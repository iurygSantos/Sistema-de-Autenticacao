"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/me');
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const handleTokenRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent;
      api.defaults.headers.common['Authorization'] = `Bearer ${customEvent.detail}`;
    };

    const handleForceLogout = async () => {
      try {
        await api.post('/auth/logout');
      } catch (e) {
        // ignore
      }
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      if (pathname !== '/login') {
        router.push('/login');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('token_refreshed', handleTokenRefreshed);
      window.addEventListener('force_logout', handleForceLogout);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('token_refreshed', handleTokenRefreshed);
        window.removeEventListener('force_logout', handleForceLogout);
      }
    };
  }, [router, pathname]);

  const login = (token: string, userData: User) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch(e) {
      console.error('Logout failed', e);
    } finally {
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
