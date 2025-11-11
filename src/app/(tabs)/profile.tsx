import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar, PostList } from '../../components';
import { Post } from '../../types';
import postsData from '../../../assets/data/posts.json';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  // Filter posts to show only user's posts
  const userPosts: Post[] = postsData.filter(post => post.user.id === user?.id);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Please sign in</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <FontAwesome name="sign-out" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View className="p-6 items-center border-b border-gray-100">
          <UserAvatar user={user} size="lg" />
          <Text className="text-xl font-bold mt-3 text-gray-900">{user.name}</Text>
          <Text className="text-gray-600">@{user.username}</Text>
          {user.email && (
            <Text className="text-gray-500 mt-1">{user.email}</Text>
          )}

          {/* Stats */}
          <View className="flex-row justify-around w-full mt-6">
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900">{userPosts.length}</Text>
              <Text className="text-gray-600 text-sm">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900">
                {userPosts.reduce((sum, post) => sum + post.likes, 0)}
              </Text>
              <Text className="text-gray-600 text-sm">Likes</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-900">
                {userPosts.reduce((sum, post) => sum + post.comments, 0)}
              </Text>
              <Text className="text-gray-600 text-sm">Comments</Text>
            </View>
          </View>
        </View>

        {/* User's Posts */}
        <View className="p-4">
          <Text className="text-lg font-semibold mb-4 text-gray-900">Your Posts</Text>
          {userPosts.length > 0 ? (
            <PostList posts={userPosts} />
          ) : (
            <View className="items-center py-8">
              <FontAwesome name="camera" size={40} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">No posts yet</Text>
              <Text className="text-gray-400 text-sm mt-1">Share your first post!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}