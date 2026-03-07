import { useCallback, useMemo, useState } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { AppearanceMode, DietaryTag, StudentProfile, User } from '@/types';

interface SessionContextValue {
  currentUser: User | null;
  needsOnboarding: boolean;
  isAuthenticated: boolean;
  effectiveDietaryTags: DietaryTag[];
  appearanceMode: AppearanceMode;
  highContrastEnabled: boolean;
  textSizeMultiplier: number;
  appLanguage: string;
  resolvedColorScheme: ColorSchemeName;
  login: (user: User, options?: { needsOnboarding?: boolean }) => void;
  logout: () => void;
  completeOnboarding: (dietaryRestrictions: DietaryTag[]) => void;
  updateDietaryPreferences: (tags: DietaryTag[]) => void;
  setNeedsOnboarding: (value: boolean) => void;
  setAppearanceMode: (mode: AppearanceMode) => void;
  setHighContrastEnabled: (enabled: boolean) => void;
  setTextSizeMultiplier: (multiplier: number) => void;
  setAppLanguage: (lang: string) => void;
}

export const [SessionProvider, useSession] = createContextHook<SessionContextValue>(() => {
  const systemScheme = useColorScheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [appearanceMode, setAppearanceModeState] = useState<AppearanceMode>('system');
  const [highContrastEnabled, setHighContrastEnabledState] = useState<boolean>(false);
  const [textSizeMultiplier, setTextSizeMultiplierState] = useState<number>(1.0);
  const [appLanguage, setAppLanguageState] = useState<string>('en');

  const resolvedColorScheme = useMemo<ColorSchemeName>(() => {
    if (appearanceMode === 'system') return systemScheme ?? 'light';
    return appearanceMode;
  }, [appearanceMode, systemScheme]);

  const login = useCallback((user: User, options?: { needsOnboarding?: boolean }) => {
    console.log('[Session] Logging in user:', user.email, 'role:', user.role, 'needsOnboarding:', options?.needsOnboarding ?? false);
    setCurrentUser(user);
    setNeedsOnboarding(options?.needsOnboarding ?? false);
  }, []);

  const logout = useCallback(() => {
    console.log('[Session] Logging out current session');
    setCurrentUser(null);
    setNeedsOnboarding(false);
  }, []);

  const completeOnboarding = useCallback((dietaryRestrictions: DietaryTag[]) => {
    console.log('[Session] Completing onboarding with restrictions:', dietaryRestrictions.join(', ') || 'none');
    setCurrentUser((prev) => {
      if (!prev) {
        console.log('[Session] Tried to complete onboarding without a current user');
        return prev;
      }

      const profile: StudentProfile = {
        dietaryRestrictions,
        hasCompletedOnboarding: true,
      };

      return {
        ...prev,
        profile,
      };
    });
    setNeedsOnboarding(false);
  }, []);

  const updateDietaryPreferences = useCallback((tags: DietaryTag[]) => {
    console.log('[Session] Updating dietary preferences:', tags.join(', ') || 'none');
    setCurrentUser((prev) => {
      if (!prev || prev.role !== 'student') {
        return prev;
      }

      return {
        ...prev,
        profile: {
          dietaryRestrictions: tags,
          hasCompletedOnboarding: true,
        },
      };
    });
  }, []);

  const setAppearanceMode = useCallback((mode: AppearanceMode) => {
    console.log('[Session] Setting appearance mode:', mode);
    setAppearanceModeState(mode);
    void AsyncStorage.setItem('appearanceMode', mode);
  }, []);

  const setHighContrastEnabled = useCallback((enabled: boolean) => {
    console.log('[Session] Setting high contrast:', enabled);
    setHighContrastEnabledState(enabled);
    void AsyncStorage.setItem('highContrastEnabled', String(enabled));
  }, []);

  const setTextSizeMultiplier = useCallback((multiplier: number) => {
    console.log('[Session] Setting text size multiplier:', multiplier);
    setTextSizeMultiplierState(multiplier);
    void AsyncStorage.setItem('textSizeMultiplier', String(multiplier));
  }, []);

  const setAppLanguage = useCallback((lang: string) => {
    console.log('[Session] Setting app language:', lang);
    setAppLanguageState(lang);
    void AsyncStorage.setItem('appLanguage', lang);
  }, []);

  return useMemo<SessionContextValue>(() => ({
    currentUser,
    needsOnboarding,
    isAuthenticated: currentUser !== null,
    effectiveDietaryTags: currentUser?.profile?.dietaryRestrictions ?? [],
    appearanceMode,
    highContrastEnabled,
    textSizeMultiplier,
    appLanguage,
    resolvedColorScheme,
    login,
    logout,
    completeOnboarding,
    updateDietaryPreferences,
    setNeedsOnboarding,
    setAppearanceMode,
    setHighContrastEnabled,
    setTextSizeMultiplier,
    setAppLanguage,
  }), [appLanguage, appearanceMode, completeOnboarding, currentUser, highContrastEnabled, login, logout, needsOnboarding, resolvedColorScheme, setAppLanguage, setAppearanceMode, setHighContrastEnabled, setTextSizeMultiplier, textSizeMultiplier, updateDietaryPreferences]);
});
