import { Redirect, Tabs } from 'expo-router';
import { Bell, Calendar, Settings, UtensilsCrossed } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';
import { getColors } from '@/constants/colors';
import { t } from '@/constants/i18n';
import { useSession } from '@/contexts/SessionContext';

export default function TabLayout() {
  const { isAuthenticated, currentUser, needsOnboarding, resolvedColorScheme, highContrastEnabled, appLanguage } = useSession();
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
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 0.5,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadow,
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: -3 },
            },
            android: {
              elevation: 8,
            },
            web: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
          marginTop: -2,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: t(appLanguage, 'today'),
          tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="weekly"
        options={{
          title: t(appLanguage, 'weekly'),
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: t(appLanguage, 'updates'),
          tabBarLabel: t(appLanguage, 'updates'),
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
          href: currentUser?.role === 'visitor' ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t(appLanguage, 'settings'),
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
