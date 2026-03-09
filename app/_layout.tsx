import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { InventoryStoreProvider } from '@/contexts/InventoryStoreContext';
import { MenuStoreProvider } from '@/contexts/MenuStoreContext';
import { RatingsStoreProvider } from '@/contexts/RatingsStoreContext';
import { SessionProvider, useSession } from '@/contexts/SessionContext';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function StatusBarStyle() {
  const { resolvedColorScheme } = useSession();
  return <StatusBar style={resolvedColorScheme === 'dark' ? 'light' : 'dark'} />;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SessionProvider>
          <StatusBarStyle />
          <MenuStoreProvider>
            <RatingsStoreProvider>
              <InventoryStoreProvider>
                <RootLayoutNav />
              </InventoryStoreProvider>
            </RatingsStoreProvider>
          </MenuStoreProvider>
        </SessionProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
