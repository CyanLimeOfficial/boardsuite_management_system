// credentials/AuthCredentials.tsx
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the User type
interface User {
  id: number;
  username: string;
  full_name: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthCredentialsContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // --- THIS IS THE ONLY CHANGE NEEDED ---
          // Update the URL to your new session endpoint
          const response = await fetch('/api/session', {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } catch (error) {
          console.error('Session fetch error:', error);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUserSession();
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthCredentialsContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthCredentialsContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthCredentialsContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}