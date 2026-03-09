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
          contentStyle: { backgroundColor: colors.backgroundMain },
          headerStyle: { backgroundColor: colors.backgroundMain },
          headerLargeTitleStyle: { color: colors.textPrimary },
          headerTitleStyle: { color: colors.textPrimary, fontWeight: '600' },
        }}
      />
    </Stack>
  );
}
