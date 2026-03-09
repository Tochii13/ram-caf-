import React, { useMemo, useState, useEffect } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { RotateCcw } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import Card from '@/components/Card';
import OnboardingFlow from '@/components/OnboardingFlow';
import { useSession } from '@/contexts/SessionContext';
import { ALLERGEN_LABELS, DIETARY_TAG_EMOJIS, DIETARY_TAG_LABELS, DietaryTag, Allergen, AppearanceMode } from '@/types';

const ALL_DIETARY_TAGS: DietaryTag[] = ['vegetarian', 'vegan', 'glutenFree', 'highProtein', 'dairyFree', 'nutFree', 'halal'];
const ALL_ALLERGENS: Allergen[] = ['nuts', 'dairy', 'shellfish', 'gluten', 'soy', 'eggs', 'pork'];

const APPEARANCE_OPTIONS: { key: AppearanceMode; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

const LANGUAGE_OPTIONS = [
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Spanish' },
  { key: 'fr', label: 'French' },
  { key: 'ne', label: 'Nepali' },
];

function hasTag(tags: DietaryTag[], tag: DietaryTag): boolean {
  return tags.includes(tag);
}

export default function SettingsScreen() {
  const {
    currentUser,
    logout,
    effectiveDietaryTags,
    effectiveAllergies,
    effectiveOtherAllergies,
    updateDietaryPreferences,
    updateAllergies,
    updateOtherDietary,
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
  const [localDietary, setLocalDietary] = useState<DietaryTag[]>(() => effectiveDietaryTags);
  const [localAllergies, setLocalAllergies] = useState<Allergen[]>(() => effectiveAllergies);
  const [otherDietaryText, setOtherDietaryText] = useState<string>(() => (currentUser?.profile?.otherDietaryRestrictions ?? []).join(', '));
  const [otherAllergiesText, setOtherAllergiesText] = useState<string>(() => (effectiveOtherAllergies ?? []).join(', '));
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLocalDietary(effectiveDietaryTags);
    setLocalAllergies(effectiveAllergies);
    setOtherDietaryText((currentUser?.profile?.otherDietaryRestrictions ?? []).join(', '));
    setOtherAllergiesText((effectiveOtherAllergies ?? []).join(', '));
  }, [effectiveDietaryTags, effectiveAllergies, effectiveOtherAllergies, currentUser?.profile?.otherDietaryRestrictions]);

  const dietaryRestrictions = localDietary;

  const dietarySummary = useMemo(() => {
    if (dietaryRestrictions.length === 0) return 'No preferences set.';
    return dietaryRestrictions.map((item) => DIETARY_TAG_LABELS[item]).join(', ');
  }, [dietaryRestrictions]);

  const toggleDietaryTag = (tag: DietaryTag, enabled: boolean) => {
    setLocalDietary((prev) => (enabled ? [...prev, tag] : prev.filter((item) => item !== tag)));
  };

  const toggleAllergy = (allergen: Allergen, enabled: boolean) => {
    setLocalAllergies((prev) => (enabled ? [...prev, allergen] : prev.filter((a) => a !== allergen)));
  };

  const handleSavePreferences = () => {
    const otherD = otherDietaryText.trim() ? otherDietaryText.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const otherA = otherAllergiesText.trim() ? otherAllergiesText.split(',').map((s) => s.trim()).filter(Boolean) : [];
    updateDietaryPreferences(localDietary);
    updateOtherDietary(otherD);
    updateAllergies(localAllergies, otherA.length ? otherA : undefined);
    setSaveFeedback('Saved');
    setTimeout(() => setSaveFeedback(null), 2000);
  };

  const handleLanguageChange = (lang: string) => {
    if (lang !== 'en') {
      Alert.alert('Coming Soon', 'Spanish, French, and Nepali are coming soon. The app currently supports English.');
      return;
    }
    setAppLanguage(lang);
  };

  const handleNotificationToggle = (setter: (v: boolean) => void, value: boolean) => {
    if (value && Platform.OS !== 'web') {
      setter(value);
    } else {
      setter(value);
    }
  };

  return (
    <>
      <ScrollView style={[styles.scroll, { backgroundColor: colors.backgroundMain }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PROFILE</Text>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.brandPrimary }]}>
              <Text style={styles.avatarText}>{currentUser?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>{currentUser?.name ?? 'User'}</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{currentUser?.email ?? ''}</Text>
              <Text style={[styles.profileDietary, { color: colors.textSecondary }]}>{dietarySummary}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: `${colors.brandPrimary}1F` }]}>
              <Text style={[styles.roleBadgeText, { color: colors.brandPrimary }]}>Student</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DISPLAY</Text>

          <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Appearance</Text>
          <View style={styles.segmentRow}>
            {APPEARANCE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setAppearanceMode(opt.key)}
                style={[
                  styles.segmentButton,
                  { borderColor: colors.borderSubtle },
                  appearanceMode === opt.key && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
                ]}
                accessibilityLabel={`${opt.label} appearance`}
                accessibilityRole="button"
                accessibilityState={{ selected: appearanceMode === opt.key }}
              >
                <Text style={[styles.segmentText, { color: colors.textPrimary }, appearanceMode === opt.key && { color: '#FFFFFF' }]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>High Contrast</Text>
            <Switch
              value={highContrastEnabled}
              onValueChange={setHighContrastEnabled}
              trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }}
              thumbColor="#FFFFFF"
              accessibilityLabel="High Contrast mode"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Text Size</Text>
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

          <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Language</Text>
          <View style={styles.segmentRow}>
            {LANGUAGE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => handleLanguageChange(opt.key)}
                style={[
                  styles.segmentButton,
                  { borderColor: colors.borderSubtle },
                  appLanguage === opt.key && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
                ]}
                accessibilityLabel={`${opt.label} language`}
                accessibilityRole="button"
                accessibilityState={{ selected: appLanguage === opt.key }}
              >
                <Text style={[styles.segmentText, { color: colors.textPrimary }, appLanguage === opt.key && { color: '#FFFFFF' }]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PREFERENCES & ALLERGIES</Text>
          <Pressable
            onPress={() => router.push('/settings/dietary')}
            style={({ pressed }) => [styles.navRow, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel="Edit dietary preferences"
          >
            <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Dietary preferences</Text>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <Pressable
            onPress={() => router.push('/settings/allergies')}
            style={({ pressed }) => [styles.navRow, pressed && styles.rowPressed]}
            accessibilityRole="button"
            accessibilityLabel="Edit allergies"
          >
            <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Allergies</Text>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <Pressable
            onPress={() => setShowQuiz(true)}
            style={({ pressed }) => [styles.quizRow, pressed && styles.rowPressed]}
            testID="retake-preferences-quiz-button"
            accessibilityLabel="Retake Preferences Quiz"
            accessibilityRole="button"
          >
            <View style={styles.quizLabelWrap}>
              <RotateCcw size={16} color={colors.brandPrimary} />
              <Text style={[styles.quizText, { color: colors.brandPrimary }]}>Retake Preferences Quiz</Text>
            </View>
          </Pressable>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Announcements</Text>
            <Switch value={notifAnnouncements} onValueChange={(v) => handleNotificationToggle(setNotifAnnouncements, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>New Menu Items</Text>
            <Switch value={notifNewMenu} onValueChange={(v) => handleNotificationToggle(setNotifNewMenu, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Daily Menu Reminder</Text>
            <Switch value={notifDailyReminder} onValueChange={(v) => handleNotificationToggle(setNotifDailyReminder, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Meal Period Alerts</Text>
            <Switch value={notifMealAlerts} onValueChange={(v) => handleNotificationToggle(setNotifMealAlerts, v)} trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }} thumbColor="#FFFFFF" />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT</Text>
          <Pressable onPress={logout} style={({ pressed }) => [styles.logoutRow, pressed && styles.rowPressed]} testID="logout-button" accessibilityLabel="Log Out" accessibilityRole="button">
            <Text style={[styles.logoutText, { color: colors.destructive }]}>Log Out</Text>
          </Pressable>
        </Card>

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
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  profileDietary: {
    fontSize: 13,
    marginTop: 6,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
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
    minHeight: 44,
  },
  toggleLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  quizRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
  quizLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quizText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  subtitleSmall: {
    fontSize: 13,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  saveButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  logoutRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
  rowPressed: {
    opacity: 0.6,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  bottomPad: {
    height: 24,
  },
  modalShell: {
    flex: 1,
  },
});
