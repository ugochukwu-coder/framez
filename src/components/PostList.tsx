import { FlatList, RefreshControl } from 'react-native';
import { Post } from '../types';
import PostItem from './Post';

interface PostListProps {
  posts: Post[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onLikePost?: (postId: string) => void;
  onCommentPost?: (postId: string) => void;
}

export default function PostList({ 
  posts, 
  onRefresh, 
  refreshing = false,
  onLikePost,
  onCommentPost 
}: PostListProps) {
  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <PostItem 
          post={item} 
          onLike={onLikePost}
          onComment={onCommentPost}
        />
      )}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#000"
          />
        ) : undefined
      }
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}