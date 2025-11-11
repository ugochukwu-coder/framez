import { Text, View, Image } from "react-native";
import posts from '../../../assets/data/posts.json';


const post1 = posts[0];

export default function HomeScreen() {
  
  return(
    <View className="">
       {/* Header */}
        <View>
          <Image
          source={{uri: post1.image_url}}
          className="w-12 aspect-square rounded-full"/>
        </View>
       
        <Image source={{uri: post1.image_url}} className="w-full aspect-[4/3]"/>
      
      
    </View>
  ) 
}
