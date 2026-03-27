import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function AdminInventoryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Inventory',
          headerStyle: { backgroundColor: Colors.backgroundMain },
          headerTitleStyle: { color: Colors.textPrimary, fontWeight: '700' },
        }}
      />
    </Stack>
  );
}
