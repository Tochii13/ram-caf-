import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: Colors.backgroundMain },
          headerTitleStyle: { color: Colors.textPrimary, fontWeight: '600' },
        }}
      />
      <Stack.Screen
        name="dietary"
        options={{
          title: 'Dietary Preferences',
          headerStyle: { backgroundColor: Colors.backgroundMain },
          headerTitleStyle: { color: Colors.textPrimary, fontWeight: '600' },
        }}
      />
      <Stack.Screen
        name="allergies"
        options={{
          title: 'Allergies',
          headerStyle: { backgroundColor: Colors.backgroundMain },
          headerTitleStyle: { color: Colors.textPrimary, fontWeight: '600' },
        }}
      />
    </Stack>
  );
}
