import { useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { PostList } from '../../components';
import { Post, User } from '../../types';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from 'expo-router';

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const loadPosts = async () => {
    try {
      // FIXED: Use correct table name and join
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles!user_id (
            id,
            username,
            full_name,
            avatar_url,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPosts: Post[] = data.map(item => ({
          id: item.id,
          user_id: item.user_id,
          user: item.user as User,
          image_url: item.image_url,
          caption: item.caption,
          created_at: item.created_at,
          likes: item.likes || 0,
          comments: item.comments || 0,
        }));
        setPosts(formattedPosts);
      }
    } catch (error: any) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLikePost = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const { error } = await supabase
          .from('posts')
          .update({ likes: post.likes + 1 })
          .eq('id', postId);

        if (error) throw error;

        setPosts(currentPosts => 
          currentPosts.map(post => 
            post.id === postId 
              ? { ...post, likes: post.likes + 1 }
              : post
          )
        );
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleCommentPost = (postId: string) => {
    Alert.alert('Comments', 'Comment feature coming soon!');
  };

  return (
    <View className="flex-1 bg-white">
      <View className="pt-12 px-4 pb-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Framez</Text>
        <Text className="text-gray-600 mt-1">Share your moments</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Loading posts...</Text>
        </View>
      ) : posts.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg mb-2">No posts yet</Text>
          <Text className="text-gray-400">Be the first to share something!</Text>
        </View>
      ) : (
        <PostList
          posts={posts}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onLikePost={handleLikePost}
          onCommentPost={handleCommentPost}
        />
      )}
    </View>
  );
}