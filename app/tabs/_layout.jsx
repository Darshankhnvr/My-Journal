// app/tabs/_layout.jsx
import { Tabs } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Journal', tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="journal-whills" size={24} color="black" />
          ), }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore',  tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="search" size={24} color="black" />
          ) }} />
    </Tabs>
  );
}
