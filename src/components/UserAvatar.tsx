import { View, Image } from 'react-native';
import { User } from '../types';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  return (
    <View className={`${sizeClasses[size]} rounded-full overflow-hidden border border-gray-200`}>
      <Image 
        source={{ uri: user.avatar_url }} 
        className="w-full h-full"
        resizeMode="cover"
      />
    </View>
  );
}