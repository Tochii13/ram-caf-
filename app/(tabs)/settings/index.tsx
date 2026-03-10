import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Alert, Animated, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { ChevronRight, LogOut, RotateCcw, Shield, Sun, Type, Globe, Bell, Heart, AlertTriangle } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useSession } from '@/contexts/SessionContext';
import { DIETARY_TAG_LABELS, DietaryTag, AppearanceMode } from '@/types';

const APPEARANCE_OPTIONS: { key: AppearanceMode; label: string; icon: 'sun' | 'moon' | 'system' }[] = [
  { key: 'system', label: 'Auto', icon: 'system' },
  { key: 'light', label: 'Light', icon: 'sun' },
  { key: 'dark', label: 'Dark', icon: 'moon' },
];

const LANGUAGE_OPTIONS = [
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Spanish' },
  { key: 'fr', label: 'French' },
  { key: 'ne', label: 'Nepali' },
];

export default function SettingsScreen() {
  const {
    currentUser,
    logout,
    effectiveDietaryTags,
    appearanceMode,
    setAppearanceMode,
    highContrastEnabled,
    setHighContrastEnabled,
    textSizeMultiplier,
    setTextSizeMultiplier,
    appLanguage,
    setAppLanguage,
    resolvedColorScheme,
  } = useSession();

  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const router = useRouter();
  const [notifAnnouncements, setNotifAnnouncements] = useState<boolean>(false);
  const [notifNewMenu, setNotifNewMenu] = useState<boolean>(false);
  const [notifDailyReminder, setNotifDailyReminder] = useState<boolean>(false);
  const [notifMealAlerts, setNotifMealAlerts] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const dietarySummary = useMemo(() => {
    if (effectiveDietaryTags.length === 0) return 'No preferences set';
    return effectiveDietaryTags.map((item: DietaryTag) => DIETARY_TAG_LABELS[item]).join(', ');
  }, [effectiveDietaryTags]);

  const handleLanguageChange = (lang: string) => {
    if (lang !== 'en') {
      Alert.alert('Coming Soon', 'Additional languages are coming soon. The app currently supports English.');
      return;
    }
    setAppLanguage(lang);
  };

  const handleNotificationToggle = (setter: (v: boolean) => void, value: boolean) => {
    if (Platform.OS !== 'web' && value) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setter(value);
  };

  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    logout();
  };

  return (
    <>
      <ScrollView style={[styles.scroll, { backgroundColor: colors.backgroundMain }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.profileCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
            <View style={[styles.avatar, { backgroundColor: colors.brandPrimary }]}>
              <Text style={styles.avatarText}>{currentUser?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
            </View>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{currentUser?.name ?? 'User'}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{currentUser?.email ?? ''}</Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.brandPrimaryLight }]}>
              <Text style={[styles.roleBadgeText, { color: colors.brandPrimary }]}>Student</Text>
            </View>
            <Text style={[styles.profileDietary, { color: colors.textSecondary }]}>{dietarySummary}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DISPLAY</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.brandPrimaryLight }]}>
                <Sun size={16} color={colors.brandPrimary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Appearance</Text>
            </View>
            <View style={styles.segmentRow}>
              {APPEARANCE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAppearanceMode(opt.key);
                  }}
                  style={[
                    styles.segmentButton,
                    { backgroundColor: appearanceMode === opt.key ? colors.brandPrimary : colors.surfaceTimeBlock },
                  ]}
                  accessibilityLabel={`${opt.label} appearance`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: appearanceMode === opt.key }}
                >
                  <Text style={[styles.segmentText, { color: appearanceMode === opt.key ? '#FFFFFF' : colors.textSecondary }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(230,126,34,0.12)' }]}>
                  <Shield size={16} color="#E67E22" />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>High Contrast</Text>
              </View>
              <Switch
                value={highContrastEnabled}
                onValueChange={setHighContrastEnabled}
                trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }}
                thumbColor="#FFFFFF"
                accessibilityLabel="High Contrast mode"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accentGoldLight }]}>
                <Type size={16} color={colors.accentGold} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Text Size</Text>
            </View>
            <View style={styles.sliderRow}>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary, fontSize: 13 }]}>A</Text>
              <View style={styles.sliderWrap}>
                <Slider
                  minimumValue={0.85}
                  maximumValue={1.4}
                  step={0.05}
                  value={textSizeMultiplier}
                  onSlidingComplete={setTextSizeMultiplier}
                  minimumTrackTintColor={colors.brandPrimary}
                  maximumTrackTintColor={colors.borderSubtle}
                  thumbTintColor={colors.brandPrimary}
                  accessibilityLabel={`Text size: ${Math.round(textSizeMultiplier * 100)}%`}
                />
              </View>
              <Text style={[styles.sliderLabel, { color: colors.textSecondary, fontSize: 20 }]}>A</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accentGreenLight }]}>
                <Globe size={16} color={colors.accentGreen} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Language</Text>
            </View>
            <View style={styles.segmentRow}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => handleLanguageChange(opt.key)}
                  style={[
                    styles.segmentButton,
                    { backgroundColor: appLanguage === opt.key ? colors.brandPrimary : colors.surfaceTimeBlock },
                  ]}
                  accessibilityLabel={`${opt.label} language`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: appLanguage === opt.key }}
                >
                  <Text style={[styles.segmentText, { color: appLanguage === opt.key ? '#FFFFFF' : colors.textSecondary }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PREFERENCES & ALLERGIES</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
            <Pressable
              onPress={() => router.push('/settings/dietary')}
              style={({ pressed }) => [styles.navRow, pressed && styles.rowPressed]}
              accessibilityRole="button"
              accessibilityLabel="Edit dietary preferences"
            >
              <View style={styles.navRowLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.accentGreenLight }]}>
                  <Heart size={16} color={colors.accentGreen} />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Dietary Preferences</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <Pressable
              onPress={() => router.push('/settings/allergies')}
              style={({ pressed }) => [styles.navRow, pressed && styles.rowPressed]}
              accessibilityRole="button"
              accessibilityLabel="Edit allergies"
            >
              <View style={styles.navRowLeft}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(230,126,34,0.12)' }]}>
                  <AlertTriangle size={16} color="#E67E22" />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Allergies</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowQuiz(true);
              }}
              style={({ pressed }) => [styles.navRow, pressed && styles.rowPressed]}
              testID="retake-preferences-quiz-button"
              accessibilityLabel="Retake Preferences Quiz"
              accessibilityRole="button"
            >
              <View style={styles.navRowLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.brandPrimaryLight }]}>
                  <RotateCcw size={16} color={colors.brandPrimary} />
                </View>
                <Text style={[styles.quizText, { color: colors.brandPrimary }]}>Retake Preferences Quiz</Text>
              </View>
            </Pressable>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.brandPrimaryLight }]}>
                  <Bell size={16} color={colors.brandPrimary} />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Announcements</Text>
              </View>
              <Switch value={notifAnnouncements} onValueChange={(v) => handleNotificationToggle(setNotifAnnouncements, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary, marginLeft: 44 }]}>New Menu Items</Text>
              </View>
              <Switch value={notifNewMenu} onValueChange={(v) => handleNotificationToggle(setNotifNewMenu, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary, marginLeft: 44 }]}>Daily Menu Reminder</Text>
              </View>
              <Switch value={notifDailyReminder} onValueChange={(v) => handleNotificationToggle(setNotifDailyReminder, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary, marginLeft: 44 }]}>Meal Period Alerts</Text>
              </View>
              <Switch value={notifMealAlerts} onValueChange={(v) => handleNotificationToggle(setNotifMealAlerts, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT</Text>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }, pressed && styles.rowPressed]}
            testID="logout-button"
            accessibilityLabel="Log Out"
            accessibilityRole="button"
          >
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(211,47,47,0.1)' }]}>
              <LogOut size={16} color={colors.destructive} />
            </View>
            <Text style={[styles.logoutText, { color: colors.destructive }]}>Log Out</Text>
          </Pressable>

          <View style={styles.bottomPad} />
        </Animated.View>
      </ScrollView>
      <Modal visible={showQuiz} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setShowQuiz(false)}>
        <View style={[styles.modalShell, { backgroundColor: colors.backgroundMain }]}>
          <OnboardingFlow isRerun onComplete={() => setShowQuiz(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
      web: {
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700' as const,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  profileDietary: {
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
      web: {
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
    }),
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sliderLabel: {
    fontWeight: '700' as const,
  },
  sliderWrap: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  divider: {
    height: 0.5,
    marginVertical: 8,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rowPressed: {
    opacity: 0.6,
  },
  quizText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  logoutCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
      web: {
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
    }),
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bottomPad: {
    height: 24,
  },
  modalShell: {
    flex: 1,
  },
});
