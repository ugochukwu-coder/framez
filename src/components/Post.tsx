import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Post as PostType } from '../types';
import UserAvatar from './UserAvatar';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface PostProps {
  post: PostType;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export default function PostItem({ post, onLike, onComment }: PostProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // FIXED: Use created_at instead of timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  // Safe user data access
  const userName = post.user?.name || 'Unknown User';
  const userUsername = post.user?.username || 'unknown';
  // Use created_at (from database) instead of timestamp
  const postTime = post.created_at;

  return (
    <View className="bg-white mb-4 border-b border-gray-100 pb-4">
      <View className="flex-row items-center px-4 py-3">
        <UserAvatar user={post.user} size="sm" />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900">{userName}</Text>
          <Text className="text-gray-500 text-xs">@{userUsername}</Text>
        </View>
        <Text className="text-gray-400 text-xs">{formatTime(postTime)}</Text>
      </View>

      <View className="aspect-square bg-gray-100">
        {!imageError && post.image_url ? (
          <Image 
            source={{ uri: post.image_url }} 
            className="w-full h-full"
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <View className="w-full h-full justify-center items-center bg-gray-200">
            <FontAwesome name="picture-o" size={40} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">Image not available</Text>
          </View>
        )}
        
        {imageLoading && !imageError && (
          <View className="absolute inset-0 justify-center items-center bg-gray-100">
            <Text className="text-gray-500">Loading image...</Text>
          </View>
        )}
      </View>

      <View className="px-4 pt-3">
        <View className="flex-row space-x-4 mb-2">
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => onLike?.(post.id)}
          >
            <FontAwesome name="heart-o" size={20} color="#374151" />
            <Text className="ml-1 text-gray-600">{post.likes || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => onComment?.(post.id)}
          >
            <FontAwesome name="comment-o" size={20} color="#374151" />
            <Text className="ml-1 text-gray-600">{post.comments || 0}</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-900">
          <Text className="font-semibold">{userUsername} </Text>
          {post.caption || ''}
        </Text>
      </View>
    </View>
  );
}