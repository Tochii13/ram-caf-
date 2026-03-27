import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function DashboardLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Campus Hub',
          headerStyle: { backgroundColor: Colors.backgroundMain },
          headerTitleStyle: { color: Colors.textPrimary, fontWeight: '700' },
        }}
      />
    </Stack>
  );
}
