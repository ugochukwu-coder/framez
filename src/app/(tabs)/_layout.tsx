import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';


export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'black', tabBarShowLabel: false }}>
      <Tabs.Screen 
        name="index" 
        options={{
          headerTitle: 'For you',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={27} color={color} />,
        }}
      />
      <Tabs.Screen
        name="new" 
        options={{
          headerTitle: 'Create post',
          tabBarIcon: ({ color }) => <FontAwesome name="plus-square-o" size={27} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" 
        options={{
          headerTitle: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={27} color={color} />,
        }}
      />
    </Tabs>
  );
}