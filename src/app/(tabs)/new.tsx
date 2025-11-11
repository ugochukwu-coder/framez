import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function CreatePostScreen() {
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleCreatePost = async () => {
    if (!caption.trim()) {
      Alert.alert('Error', 'Please write a caption for your post');
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Please select an image for your post');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      Alert.alert('Success', 'Your post has been shared!');
      setCaption('');
      setImageUri('');
      setIsLoading(false);
    }, 1500);
  };

  const handlePickImage = () => {
    // For now, use a placeholder image
    setImageUri('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&h=500&fit=crop');
    Alert.alert('Image Picked', 'Placeholder image added (real image picker coming soon)');
  };

  return (
    <View className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="px-4 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Create Post</Text>
        <Text className="text-gray-600 mt-1">Share something with the world</Text>
      </View>

      <View className="flex-1 p-4">
        {/* Image Picker */}
        <TouchableOpacity 
          className="border-2 border-dashed border-gray-300 rounded-lg aspect-square mb-4 overflow-hidden"
          onPress={handlePickImage}
        >
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              className="w-full h-full" 
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <FontAwesome name="camera" size={40} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2 text-center">Tap to add a photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption Input */}
        <TextInput
          className="border border-gray-200 rounded-lg px-4 py-3 text-gray-900 mb-4"
          placeholder="What's on your mind?"
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Create Button */}
        <Button
          title={isLoading ? "Sharing..." : "Share Post"}
          onPress={handleCreatePost}
          loading={isLoading}
          disabled={!caption.trim() || !imageUri}
        />
      </View>
    </View>
  );
}