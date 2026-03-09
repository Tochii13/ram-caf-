import { Stack } from 'expo-router';
import React from 'react';
import { getColors } from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';

export default function SettingsLayout() {
  const { resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerStyle: { backgroundColor: colors.backgroundMain },
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '600' },
        }}
      />
      <Stack.Screen
        name="dietary"
        options={{
          title: 'Dietary Preferences',
          headerStyle: { backgroundColor: colors.backgroundMain },
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '600' },
        }}
      />
      <Stack.Screen
        name="allergies"
        options={{
          title: 'Allergies',
          headerStyle: { backgroundColor: colors.backgroundMain },
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '600' },
        }}
      />
    </Stack>
  );
}
