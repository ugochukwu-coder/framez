// types.ts
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
  user_id: string;
  user: User;
  image_url: string;
  caption: string;
  created_at: string;
  likes: number;
  comments: number;
}

export interface UserSettings {
  user_id: string;
  private_account: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  settings: UserSettings | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

export interface CreatePostData {
  image_url: string;
  caption: string;
  user_id: string;
}

export interface UpdateProfileData {
  username?: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
}
