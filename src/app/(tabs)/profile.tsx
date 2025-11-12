import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput,
  ActivityIndicator,
  Modal,
  RefreshControl
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { PostList } from '../../components';
import { Post } from '../../types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../../components/UserAvatar';

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: ''
  });

  const loadUserPosts = async () => {
    if (!user) return;
    
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserPosts(posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserPosts();
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserPosts();
    setRefreshing(false);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload profile images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadProfileImage = async (uri: string) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `avatars/${user.id}/profile.${fileExt}`;

      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: fileName,
        type: `image/${fileExt}`,
      } as any);

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, formData, {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      await updateUser({ avatar_url: publicUrl });
      Alert.alert('Success', 'Profile image updated!');
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Error', 'Failed to upload profile image.');
    } finally {
      setUploading(false);
    }
  };

  const removeProfileImage = async () => {
    if (!user) return;
    try {
      await updateUser({ avatar_url: null });
      Alert.alert('Success', 'Profile image removed!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to remove profile image.');
    }
  };

  const showImagePickerOptions = () => {
    const buttons = [
      {
        text: 'Take Photo',
        onPress: takePhoto,
      },
      {
        text: 'Choose from Gallery',
        onPress: pickImage,
      },
      ...(user?.avatar_url ? [{
        text: 'Remove Photo',
        onPress: removeProfileImage,
        style: 'destructive' as const,
      }] : []),
      {
        text: 'Cancel',
        style: 'cancel' as const,
      },
    ];

    Alert.alert('Update Profile Picture', 'Choose an option', buttons);
  };

  const openEditModal = () => {
    if (!user) return;
    
    setEditForm({
      name: user.name || '',
      username: user.username || '',
      bio: user.bio || ''
    });
    setEditModalVisible(true);
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      if (!editForm.name.trim() || !editForm.username.trim()) {
        Alert.alert('Error', 'Name and username are required');
        return;
      }

      await updateUser({
        name: editForm.name.trim(),
        username: editForm.username.trim(),
        bio: editForm.bio.trim()
      });

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' as const },
        { text: 'Sign Out', style: 'destructive' as const, onPress: signOut }
      ]
    );
  };

  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalComments = userPosts.reduce((sum, post) => sum + (post.comments || 0), 0);

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Please sign in</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="pt-12 px-4 pb-4 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <FontAwesome name="sign-out" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000"
          />
        }
      >
        <View className="p-6 items-center border-b border-gray-100">
          <TouchableOpacity 
            onPress={showImagePickerOptions}
            disabled={uploading}
            className="relative mb-4"
          >
            <UserAvatar user={user} size="lg" />
            <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 border-2 border-white">
              {uploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesome name="camera" size={12} color="white" />
              )}
            </View>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-900">{user.name}</Text>
          <Text className="text-gray-600">@{user.username}</Text>
          {user.email && (
            <Text className="text-gray-500 mt-1">{user.email}</Text>
          )}
          {user.bio && (
            <Text className="text-gray-700 mt-3 text-center">{user.bio}</Text>
          )}

          <TouchableOpacity 
            className="mt-4 border border-gray-300 rounded-lg px-4 py-2"
            onPress={openEditModal}
          >
            <Text className="text-gray-700 font-medium">Edit Profile</Text>
          </TouchableOpacity>

          <View className="flex-row justify-around w-full mt-6">
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900">{userPosts.length}</Text>
              <Text className="text-gray-600 text-sm">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900">{totalLikes}</Text>
              <Text className="text-gray-600 text-sm">Likes</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-900">{totalComments}</Text>
              <Text className="text-gray-600 text-sm">Comments</Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-lg font-semibold mb-4 text-gray-900">Your Posts</Text>
          
          {loadingPosts ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#000" />
              <Text className="text-gray-500 mt-2">Loading posts...</Text>
            </View>
          ) : userPosts.length > 0 ? (
            <PostList posts={userPosts} />
          ) : (
            <View className="items-center py-8">
              <FontAwesome name="camera" size={40} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">No posts yet</Text>
              <Text className="text-gray-400 text-sm">Share your first post!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-white pt-12">
          <View className="flex-row justify-between items-center px-4 pb-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text className="text-blue-500">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Edit Profile</Text>
            <TouchableOpacity onPress={saveProfile}>
              <Text className="text-blue-500 font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="items-center mb-6">
              <TouchableOpacity onPress={showImagePickerOptions}>
                <UserAvatar user={user} size="lg" />
                <Text className="text-blue-500 text-center mt-2">Change Photo</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-gray-700 font-medium mb-2">Name</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  value={editForm.name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                  placeholder="Your name"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Username</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  value={editForm.username}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, username: text }))}
                  placeholder="Username"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2">Bio</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 h-24"
                  value={editForm.bio}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                  placeholder="Tell us about yourself..."
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}