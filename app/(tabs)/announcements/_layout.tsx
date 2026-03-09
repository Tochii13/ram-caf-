import { Stack } from 'expo-router';
import React from 'react';
import { getColors } from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';

export default function AnnouncementsLayout() {
  const { resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Announcements',
          headerLargeTitle: true,
          headerStyle: { backgroundColor: colors.backgroundMain },
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '600' },
        }}
      />
    </Stack>
  );
}
