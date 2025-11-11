// src/types/index.ts
export interface User {
  id: string;
  username: string;
  name: string;
  avatar_url: string;
  email?: string;
}

export interface Post {
  id: string;
  user: User;
  image_url: string;
  caption: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Add database operation types
export interface CreatePostData {
  image_url: string;
  caption: string;
  user_id: string;
}

export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
}