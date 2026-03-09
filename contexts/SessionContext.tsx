import { useCallback, useMemo, useState, useEffect } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { AppearanceMode, DietaryTag, Allergen, StudentProfile, User } from '@/types';

interface SessionContextValue {
  currentUser: User | null;
  needsOnboarding: boolean;
  isAuthenticated: boolean;
  effectiveDietaryTags: DietaryTag[];
  effectiveAllergies: Allergen[];
  effectiveOtherAllergies: string[];
  appearanceMode: AppearanceMode;
  highContrastEnabled: boolean;
  textSizeMultiplier: number;
  appLanguage: string;
  resolvedColorScheme: ColorSchemeName;
  login: (user: User, options?: { needsOnboarding?: boolean }) => void;
  logout: () => void;
  completeOnboarding: (data: { dietaryRestrictions: DietaryTag[]; allergies?: Allergen[]; otherDietary?: string[]; otherAllergies?: string[] }) => void;
  updateDietaryPreferences: (tags: DietaryTag[]) => void;
  updateAllergies: (allergies: Allergen[], otherAllergies?: string[]) => void;
  updateOtherDietary: (other: string[]) => void;
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

  useEffect(() => {
    AsyncStorage.multiGet(['appearanceMode', 'highContrastEnabled', 'textSizeMultiplier', 'appLanguage']).then((pairs) => {
      pairs.forEach(([key, value]) => {
        if (value == null) return;
        if (key === 'appearanceMode' && (value === 'system' || value === 'light' || value === 'dark')) setAppearanceModeState(value);
        if (key === 'highContrastEnabled') setHighContrastEnabledState(value === 'true');
        if (key === 'textSizeMultiplier') {
          const n = parseFloat(value);
          if (!Number.isNaN(n) && n >= 0.85 && n <= 1.4) setTextSizeMultiplierState(n);
        }
        if (key === 'appLanguage') setAppLanguageState(value);
      });
    });
  }, []);

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

  const completeOnboarding = useCallback((data: { dietaryRestrictions: DietaryTag[]; allergies?: Allergen[]; otherDietary?: string[]; otherAllergies?: string[] }) => {
    console.log('[Session] Completing onboarding', data);
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const profile: StudentProfile = {
        dietaryRestrictions: data.dietaryRestrictions,
        allergies: data.allergies ?? [],
        otherAllergies: data.otherAllergies,
        otherDietaryRestrictions: data.otherDietary,
        hasCompletedOnboarding: true,
      };
      return { ...prev, profile };
    });
    setNeedsOnboarding(false);
  }, []);

  const updateDietaryPreferences = useCallback((tags: DietaryTag[]) => {
    console.log('[Session] Updating dietary preferences:', tags.join(', ') || 'none');
    setCurrentUser((prev) => {
      if (!prev || prev.role !== 'student') return prev;
      const existing = prev.profile ?? { dietaryRestrictions: [], allergies: [], hasCompletedOnboarding: true };
      return {
        ...prev,
        profile: {
          ...existing,
          dietaryRestrictions: tags,
          hasCompletedOnboarding: true,
        },
      };
    });
  }, []);

  const updateAllergies = useCallback((allergies: Allergen[], otherAllergies?: string[]) => {
    console.log('[Session] Updating allergies:', allergies.join(', ') || 'none', otherAllergies);
    setCurrentUser((prev) => {
      if (!prev || prev.role !== 'student') return prev;
      const existing = prev.profile ?? { dietaryRestrictions: [], allergies: [], hasCompletedOnboarding: true };
      return {
        ...prev,
        profile: {
          ...existing,
          allergies,
          otherAllergies,
          hasCompletedOnboarding: true,
        },
      };
    });
    void AsyncStorage.setItem('userAllergies', JSON.stringify({ allergies, otherAllergies }));
  }, []);

  const updateOtherDietary = useCallback((other: string[]) => {
    setCurrentUser((prev) => {
      if (!prev || prev.role !== 'student') return prev;
      const existing = prev.profile ?? { dietaryRestrictions: [], allergies: [], hasCompletedOnboarding: true };
      return {
        ...prev,
        profile: {
          ...existing,
          otherDietaryRestrictions: other,
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
    effectiveAllergies: currentUser?.profile?.allergies ?? [],
    effectiveOtherAllergies: currentUser?.profile?.otherAllergies ?? [],
    appearanceMode,
    highContrastEnabled,
    textSizeMultiplier,
    appLanguage,
    resolvedColorScheme,
    login,
    logout,
    completeOnboarding,
    updateDietaryPreferences,
    updateAllergies,
    updateOtherDietary,
    setNeedsOnboarding,
    setAppearanceMode,
    setHighContrastEnabled,
    setTextSizeMultiplier,
    setAppLanguage,
  }), [appLanguage, appearanceMode, completeOnboarding, currentUser, highContrastEnabled, login, logout, needsOnboarding, resolvedColorScheme, setAppLanguage, setAppearanceMode, setHighContrastEnabled, setTextSizeMultiplier, textSizeMultiplier, updateDietaryPreferences, updateAllergies, updateOtherDietary]);
});
