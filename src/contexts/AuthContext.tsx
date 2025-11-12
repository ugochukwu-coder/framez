import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await createUserProfile(userId);
          return;
        }
        console.error('Error fetching profile:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          username: data.username,
          name: data.full_name || data.username,
          avatar_url: data.avatar_url,
          email: data.email,
          bio: data.bio,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setIsLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setIsLoading(false);
        return;
      }

      const profileData = {
        id: userId,
        username: authUser.user_metadata?.username || `user_${userId.slice(0, 8)}`,
        email: authUser.email,
        full_name: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'User',
        avatar_url: null,
        bio: null,
      };

      const { error } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (error) {
        console.error('Error creating profile:', error);
        setIsLoading(false);
        return;
      }

      setTimeout(() => {
        fetchUserProfile(userId);
      }, 1000);
      
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (userData.avatar_url !== undefined) updateData.avatar_url = userData.avatar_url;
      if (userData.name !== undefined) updateData.full_name = userData.name;
      if (userData.username !== undefined) updateData.username = userData.username;
      if (userData.bio !== undefined) updateData.bio = userData.bio;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      await fetchUserProfile(user.id);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value: AuthState = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUser,
    refreshUser,
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