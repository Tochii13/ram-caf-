import { Redirect, Tabs } from 'expo-router';
import { Bell, Calendar, Settings, UtensilsCrossed } from 'lucide-react-native';
import React from 'react';
import { getColors } from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';

export default function TabLayout() {
  const { isAuthenticated, currentUser, needsOnboarding, resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);

  if (!isAuthenticated) {
    console.log('[Tabs] No authenticated user, redirecting to root auth');
    return <Redirect href="/" />;
  }

  if (needsOnboarding) {
    console.log('[Tabs] Student still needs onboarding, redirecting to root onboarding');
    return <Redirect href="/" />;
  }

  if (currentUser?.role === 'admin') {
    console.log('[Tabs] Admin session detected inside tabs, redirecting to admin dashboard');
    return <Redirect href="/dashboard" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundCard,
          borderTopColor: colors.borderSubtle,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="weekly"
        options={{
          title: 'Weekly',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Announcements',
          tabBarLabel: 'Updates',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
