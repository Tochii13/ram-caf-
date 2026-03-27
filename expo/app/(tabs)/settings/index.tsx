import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { ChevronRight, LogOut, RotateCcw, Shield, Sun, Type, Globe, Bell, Heart, AlertTriangle, UtensilsCrossed, Clock, Megaphone } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import { t, LANGUAGE_OPTIONS } from '@/constants/i18n';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useSession } from '@/contexts/SessionContext';
import { DIETARY_TAG_LABELS, DietaryTag, AppearanceMode } from '@/types';

function getAppearanceOptions(lang: string): { key: AppearanceMode; label: string; icon: 'sun' | 'moon' | 'system' }[] {
  return [
    { key: 'system', label: t(lang, 'auto'), icon: 'system' },
    { key: 'light', label: t(lang, 'light'), icon: 'sun' },
    { key: 'dark', label: t(lang, 'dark'), icon: 'moon' },
  ];
}



function AnimatedRow({ delay, children }: { delay: number; children: React.ReactNode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, delay]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}

function SegmentButton({ label, selected, onPress, colors }: { label: string; selected: boolean; onPress: () => void; colors: ReturnType<typeof getColors> }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ flex: 1, transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, speed: 50, bounciness: 4 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start()}
        onPress={onPress}
        style={[
          styles.segmentButton,
          { backgroundColor: selected ? colors.brandPrimary : colors.surfaceTimeBlock },
        ]}
        accessibilityLabel={`${label}`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Text style={[styles.segmentText, { color: selected ? '#FFFFFF' : colors.textSecondary }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

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

  const avatarScale = useRef(new Animated.Value(0.7)).current;
  const avatarOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(avatarScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(avatarOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [avatarScale, avatarOpacity]);

  const dietarySummary = useMemo(() => {
    if (effectiveDietaryTags.length === 0) return t(appLanguage, 'noPreferencesSet');
    return effectiveDietaryTags.map((item: DietaryTag) => DIETARY_TAG_LABELS[item]).join(', ');
  }, [effectiveDietaryTags, appLanguage]);

  const isVisitor = currentUser?.role === 'visitor';

  const handleLanguageChange = (lang: string) => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        <AnimatedRow delay={0}>
          <View style={[styles.profileCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
            <Animated.View style={[styles.avatar, { backgroundColor: colors.brandPrimary, opacity: avatarOpacity, transform: [{ scale: avatarScale }] }]}>
              <Text style={styles.avatarText}>{currentUser?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
            </Animated.View>
            <Text style={[styles.profileName, { color: colors.textPrimary }]}>{isVisitor ? t(appLanguage, 'visitor') : (currentUser?.name ?? 'User')}</Text>
            {!isVisitor ? <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{currentUser?.email ?? ''}</Text> : null}
            <View style={[styles.roleBadge, { backgroundColor: colors.brandPrimaryLight }]}>
              <Text style={[styles.roleBadgeText, { color: colors.brandPrimary }]}>{isVisitor ? t(appLanguage, 'visitor') : t(appLanguage, 'student')}</Text>
            </View>
            {!isVisitor ? <Text style={[styles.profileDietary, { color: colors.textSecondary }]}>{dietarySummary}</Text> : (
              <Text style={[styles.profileDietary, { color: colors.textSecondary }]}>{t(appLanguage, 'visitorNote')}</Text>
            )}
          </View>
        </AnimatedRow>

        <AnimatedRow delay={100}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t(appLanguage, 'display')}</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.brandPrimaryLight }]}>
                <Sun size={16} color={colors.brandPrimary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t(appLanguage, 'appearance')}</Text>
            </View>
            <View style={styles.segmentRow}>
              {getAppearanceOptions(appLanguage).map((opt) => (
                <SegmentButton
                  key={opt.key}
                  label={opt.label}
                  selected={appearanceMode === opt.key}
                  onPress={() => {
                    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAppearanceMode(opt.key);
                  }}
                  colors={colors}
                />
              ))}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(230,126,34,0.12)' }]}>
                  <Shield size={16} color="#E67E22" />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{t(appLanguage, 'highContrast')}</Text>
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
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t(appLanguage, 'textSize')}</Text>
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
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t(appLanguage, 'language')}</Text>
            </View>
            <View style={styles.languageGrid}>
              {LANGUAGE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => handleLanguageChange(opt.key)}
                  style={[styles.languageOption, { backgroundColor: appLanguage === opt.key ? colors.brandPrimary : colors.surfaceTimeBlock }]}
                >
                  <Text style={[styles.languageNative, { color: appLanguage === opt.key ? '#FFFFFF' : colors.textPrimary }]}>{opt.nativeLabel}</Text>
                  <Text style={[styles.languageLabel, { color: appLanguage === opt.key ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </AnimatedRow>

        {!isVisitor ? (
        <AnimatedRow delay={200}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t(appLanguage, 'preferencesAllergies')}</Text>
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
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{t(appLanguage, 'dietaryPreferences')}</Text>
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
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{t(appLanguage, 'allergies')}</Text>
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
                <Text style={[styles.quizText, { color: colors.brandPrimary }]}>{t(appLanguage, 'retakeQuiz')}</Text>
              </View>
            </Pressable>
          </View>
        </AnimatedRow>
        ) : null}

        {!isVisitor ? (
        <AnimatedRow delay={300}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t(appLanguage, 'notifications')}</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.brandPrimaryLight }]}>
                  <Megaphone size={16} color={colors.brandPrimary} />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{t(appLanguage, 'announcements')}</Text>
              </View>
              <Switch value={notifAnnouncements} onValueChange={(v) => handleNotificationToggle(setNotifAnnouncements, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.accentGreenLight }]}>
                  <UtensilsCrossed size={16} color={colors.accentGreen} />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{t(appLanguage, 'newMenuItems')}</Text>
              </View>
              <Switch value={notifNewMenu} onValueChange={(v) => handleNotificationToggle(setNotifNewMenu, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.accentGoldLight }]}>
                  <Bell size={16} color={colors.accentGold} />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{t(appLanguage, 'dailyMenuReminder')}</Text>
              </View>
              <Switch value={notifDailyReminder} onValueChange={(v) => handleNotificationToggle(setNotifDailyReminder, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(230,126,34,0.12)' }]}>
                  <Clock size={16} color="#E67E22" />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{t(appLanguage, 'mealPeriodAlerts')}</Text>
              </View>
              <Switch value={notifMealAlerts} onValueChange={(v) => handleNotificationToggle(setNotifMealAlerts, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
            </View>
          </View>
        </AnimatedRow>
        ) : null}

        <AnimatedRow delay={400}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t(appLanguage, 'account')}</Text>
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
            <Text style={[styles.logoutText, { color: colors.destructive }]}>{t(appLanguage, 'logOut')}</Text>
          </Pressable>
        </AnimatedRow>

        <View style={styles.bottomPad} />
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
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 5 },
      },
      android: { elevation: 4 },
      web: {
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 5 },
      },
    }),
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700' as const,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  profileDietary: {
    fontSize: 13,
    marginTop: 12,
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
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
      web: {
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
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
    width: 34,
    height: 34,
    borderRadius: 11,
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
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  languageOption: {
    width: '31%' as unknown as number,
    flexGrow: 1,
    minHeight: 54,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  languageNative: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  languageLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  segmentButton: {
    minHeight: 42,
    borderRadius: 13,
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
    minHeight: 50,
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
    minHeight: 50,
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
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
      web: {
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
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
