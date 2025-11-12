import { View, Image, Text } from 'react-native';
import { User } from '../types';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg'; 
  onPress?: () => void;
}

export default function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.name || user.username || 'User');

  const avatarUrl = user.avatar_url;
  const hasValidAvatar = avatarUrl && avatarUrl.trim().length > 0;

  if (hasValidAvatar) {
    return (
      <View className={`${sizeClasses[size]} rounded-full overflow-hidden border border-gray-200`}>
        <Image 
          source={{ uri: avatarUrl }} 
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View className={`${sizeClasses[size]} rounded-full bg-gray-300 justify-center items-center border border-gray-200`}>
      <Text className={`${textSizes[size]} font-semibold text-gray-600`}>
        {initials}
      </Text>
    </View>
  );
}