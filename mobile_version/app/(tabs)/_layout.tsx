import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={26} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.tint,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'CropBuddy',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'AI Classifier',
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ color }) => <TabBarIcon name="camera" color={color} />,
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: 'Weather Advisor',
          tabBarLabel: 'Weather',
          tabBarIcon: ({ color }) => <TabBarIcon name="cloud" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Chat Advisor',
          tabBarLabel: 'AI Chat',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Agri Tools',
          tabBarLabel: 'Tools',
          tabBarIcon: ({ color }) => <TabBarIcon name="calculator" color={color} />,
        }}
      />
    </Tabs>
  );
}
