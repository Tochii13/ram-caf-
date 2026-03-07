import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function WeeklyLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Weekly Menu',
          headerStyle: { backgroundColor: Colors.backgroundMain },
          headerTitleStyle: { color: Colors.textPrimary, fontWeight: '600' },
        }}
      />
    </Stack>
  );
}
