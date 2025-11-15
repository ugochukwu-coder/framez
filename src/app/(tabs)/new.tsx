import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { supabase } from "../../lib/supabase";

export default function CreatePostScreen() {
  const [caption, setCaption] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    return () => {
      setImageUri("");
      setCaption("");
    };
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: undefined,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
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
        allowsEditing: false,
        aspect: undefined,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

 const uploadImageToSupabase = async (uri: string): Promise<string> => {
  if (!user) throw new Error('User not authenticated');

  try {
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const contentType = `image/${fileExt}`;

    // Convert image to blob format that Supabase expects
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload using the blob directly
    const { error: uploadError, data } = await supabase.storage
      .from('post-images')
      .upload(fileName, blob, {
        contentType: contentType,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
};

  const handleCreatePost = async () => {
    if (!caption.trim()) {
      Alert.alert('Error', 'Please write a caption for your post');
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Please select an image for your post');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    setIsLoading(true);

    try {
      let finalImageUrl = imageUri;

      if (imageUri.startsWith('file://')) {
        finalImageUrl = await uploadImageToSupabase(imageUri);
      }

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            image_url: finalImageUrl,
            caption: caption.trim(),
            likes: 0,
            comments: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Success', 'Your post has been shared!', [
        {
          text: 'View Feed',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);

      setCaption('');
      setImageUri('');
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert('Add Photo', 'How would you like to add a photo?', [
      {
        text: 'Take Picture',
        onPress: takePhoto,
      },
      {
        text: 'Choose from Gallery',
        onPress: pickImage,
      },
      {
        text: 'Cancel',
        style: 'cancel' as const,
      },
    ]);
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Please sign in to create posts</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="pt-12 px-4 pb-4 border-b border-gray-100 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <FontAwesome name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Create Post</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="p-4">
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Add Photo</Text>
            <TouchableOpacity
              className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
              onPress={showImagePickerOptions}
              disabled={isLoading}
            >
              {imageUri ? (
                <View className="w-full aspect-square">
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded">
                    <Text className="text-white text-xs">Your selected image</Text>
                  </View>
                </View>
              ) : (
                <View className="w-full aspect-square justify-center items-center bg-gray-50">
                  <FontAwesome name="camera" size={32} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2 text-center">Tap to add a photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {imageUri && (
              <TouchableOpacity 
                className="mt-2 self-start" 
                onPress={() => setImageUri('')}
                disabled={isLoading}
              >
                <Text className="text-red-500 text-sm font-medium">Remove image</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Caption</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
              placeholder="What's on your mind?"
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>

          <Button
            title={isLoading ? 'Uploading...' : 'Share Post'}
            onPress={handleCreatePost}
            loading={isLoading}
            disabled={!caption.trim() || !imageUri || isLoading}
          />

          <TouchableOpacity
            className="mt-3 border border-gray-300 rounded-lg py-3"
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}