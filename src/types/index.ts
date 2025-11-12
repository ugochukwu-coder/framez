export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url?: string | null;
  bio?: string;
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
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface CreatePostData {
  image_url: string;
  caption: string;
  user_id: string;
}

export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}