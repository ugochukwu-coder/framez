import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

const AuthContext = createContext<AuthState | undefined>(undefined);

const mockUser: User = {
  id: '1',
  username: 'demo_user',
  name: 'Demo User', 
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  email: 'demo@framez.com'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(mockUser); 
  const [isLoading, setIsLoading] = useState(false);

  // Remove the automatic session check for now
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(mockUser); // This should persist
    setIsLoading(false);
  };

  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      ...mockUser,
      username,
      name: username,
      email
    });
    setIsLoading(false);
  };

  const signOut = async () => {
    setUser(null);
  };

  const value: AuthState = {
    user,
    isLoading,
    signIn,
    signUp, 
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};