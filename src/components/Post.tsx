import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Post as PostType } from '../types';
import UserAvatar from './UserAvatar';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface PostProps {
  post: PostType;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export default function PostItem({ post, onLike, onComment }: PostProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View className="bg-white mb-4 border-b border-gray-100 pb-4">
      <View className="flex-row items-center px-4 py-3">
        <UserAvatar user={post.user} size="sm" />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900">{post.user.name}</Text>
          <Text className="text-gray-500 text-xs">@{post.user.username}</Text>
        </View>
        <Text className="text-gray-400 text-xs">{formatTime(post.timestamp)}</Text>
      </View>

      <View className="aspect-square bg-gray-100">
        <Image 
          source={{ uri: post.image_url }} 
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <View className="px-4 pt-3">
        <View className="flex-row space-x-4 mb-2">
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => onLike?.(post.id)}
          >
            <FontAwesome name="heart-o" size={20} color="#374151" />
            <Text className="ml-1 text-gray-600">{post.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => onComment?.(post.id)}
          >
            <FontAwesome name="comment-o" size={20} color="#374151" />
            <Text className="ml-1 text-gray-600">{post.comments}</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-900">
          <Text className="font-semibold">{post.user.username} </Text>
          {post.caption}
        </Text>
      </View>
    </View>
  );
}