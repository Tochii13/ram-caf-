import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function MenuLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Menu',
          headerStyle: { backgroundColor: Colors.backgroundMain },
          headerTitleStyle: { color: Colors.textPrimary, fontWeight: '700' },
        }}
      />
    </Stack>
  );
}
