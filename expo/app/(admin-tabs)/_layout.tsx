import { Redirect, Tabs } from 'expo-router';
import { BarChart3, Calendar, Package, Settings, UtensilsCrossed } from 'lucide-react-native';
import React from 'react';
import Colors from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';

export default function AdminTabLayout() {
  const { isAuthenticated, currentUser } = useSession();

  if (!isAuthenticated) {
    console.log('[AdminTabs] No authenticated user, redirecting to root auth');
    return <Redirect href="/" />;
  }

  if (currentUser?.role !== 'admin') {
    console.log('[AdminTabs] Non-admin user inside admin tabs, redirecting to student');
    return <Redirect href="/today" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brandPrimary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.backgroundCard,
          borderTopColor: Colors.borderSubtle,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="admin-menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="admin-planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="admin-inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="admin-settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="menu"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="planner"
        options={{ href: null }}
      />
    </Tabs>
  );
}
