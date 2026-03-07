import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function FavoritesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Favorites',
          headerStyle: { backgroundColor: Colors.backgroundMain },
          headerTitleStyle: { color: Colors.textPrimary, fontWeight: '600' },
        }}
      />
    </Stack>
  );
}
