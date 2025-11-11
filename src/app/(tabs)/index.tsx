import { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { PostList } from '../../components';
import { Post } from '../../types';
import postsData from '../../../assets/data/posts.json';

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    setPosts(postsData as Post[]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadPosts();
      setRefreshing(false);
    }, 1000);
  };

  const handleLikePost = (postId: string) => {
    setPosts(currentPosts => 
      currentPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.likes + 1 // Just increment likes without tracking like state
            }
          : post
      )
    );
  };

  const handleCommentPost = (postId: string) => {
    Alert.alert('Comments', 'Comment feature coming soon!');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 px-4 pb-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Framez</Text>
        <Text className="text-gray-600 mt-1">Share your moments</Text>
      </View>

      {/* Posts List */}
      <PostList
        posts={posts}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onLikePost={handleLikePost}
        onCommentPost={handleCommentPost}
      />
    </View>
  );
}