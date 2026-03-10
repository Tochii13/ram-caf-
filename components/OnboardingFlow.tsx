import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, CheckCircle2 } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';
import { DIETARY_TAG_EMOJIS, DIETARY_TAG_LABELS, DietaryTag, Allergen, ALLERGEN_LABELS } from '@/types';

const ALL_DIETARY_TAGS: DietaryTag[] = ['vegetarian', 'vegan', 'glutenFree', 'highProtein', 'dairyFree', 'nutFree', 'halal'];
const ALL_ALLERGENS: Allergen[] = ['nuts', 'dairy', 'shellfish', 'gluten', 'soy', 'eggs', 'pork'];

interface OnboardingFlowProps {
  isRerun?: boolean;
  onComplete?: () => void;
}

type OnboardingStep = 0 | 1 | 2 | 3;

function getFirstName(name?: string): string {
  const trimmed = name?.trim() ?? '';
  return trimmed.split(' ')[0] || 'Student';
}

function DietaryOptionRow({ tag, selected, onPress, colors }: { tag: DietaryTag; selected: boolean; onPress: () => void; colors: ReturnType<typeof getColors> }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 6 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.preferenceRow,
          { backgroundColor: colors.backgroundCard, borderColor: colors.borderSubtle },
          selected && { borderColor: colors.brandPrimary, borderWidth: 2, backgroundColor: colors.brandPrimaryLight },
        ]}
        testID={`dietary-option-${tag}`}
        accessibilityLabel={`${DIETARY_TAG_LABELS[tag]} dietary preference`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
      >
        <Text style={styles.preferenceEmoji}>{DIETARY_TAG_EMOJIS[tag]}</Text>
        <Text style={[styles.preferenceLabel, { color: colors.textPrimary }]}>{DIETARY_TAG_LABELS[tag]}</Text>
        {selected ? (
          <View style={[styles.checkCircle, { backgroundColor: colors.brandPrimary }]}>
            <Check size={14} color="#FFFFFF" />
          </View>
        ) : (
          <View style={[styles.checkCircleEmpty, { borderColor: colors.borderSubtle }]} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function OnboardingFlow({ isRerun = false, onComplete }: OnboardingFlowProps) {
  const { currentUser, completeOnboarding, resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const [step, setStep] = useState<OnboardingStep>(isRerun ? 1 : 0);
  const [selectedTags, setSelectedTags] = useState<DietaryTag[]>(currentUser?.profile?.dietaryRestrictions ?? []);
  const [selectedAllergies, setSelectedAllergies] = useState<Allergen[]>(currentUser?.profile?.allergies ?? []);
  const [otherAllergiesText, setOtherAllergiesText] = useState<string>(() => (currentUser?.profile?.otherAllergies ?? []).join(', '));
  const [otherDietaryText, setOtherDietaryText] = useState<string>(() => (currentUser?.profile?.otherDietaryRestrictions ?? []).join(', '));
  const welcomeScale = useRef(new Animated.Value(0.85)).current;
  const finalScale = useRef(new Animated.Value(0.5)).current;
  const finalOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslate = useRef(new Animated.Value(0)).current;

  const firstName = useMemo(() => getFirstName(currentUser?.name), [currentUser?.name]);

  useEffect(() => {
    contentOpacity.setValue(0.25);
    contentTranslate.setValue(16);
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 260, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(contentTranslate, { toValue: 0, duration: 260, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    if (step === 0) {
      welcomeScale.setValue(0.85);
      Animated.spring(welcomeScale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }).start();
    }

    if (step === 3) {
      finalScale.setValue(0.5);
      finalOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(finalScale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
        Animated.timing(finalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [contentOpacity, contentTranslate, finalOpacity, finalScale, step, welcomeScale]);

  const toggleAllergen = (allergen: Allergen) => {
    setSelectedAllergies((prev) => (prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]));
  };

  const toggleTag = (tag: DietaryTag) => {
    console.log('[Onboarding] Toggling preference:', tag);
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  const handleFinish = () => {
    const otherA = otherAllergiesText.trim() ? otherAllergiesText.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const otherD = otherDietaryText.trim() ? otherDietaryText.split(',').map((s) => s.trim()).filter(Boolean) : [];
    completeOnboarding({ dietaryRestrictions: selectedTags, allergies: selectedAllergies, otherAllergies: otherA.length ? otherA : undefined, otherDietary: otherD.length ? otherD : undefined });
    onComplete?.();
  };

  const isCenteredStep = step === 0 || step === 3;

  return (
    <View style={[styles.shell, { backgroundColor: colors.backgroundMain, justifyContent: isCenteredStep ? 'center' : 'flex-start' }]}>
      <View style={styles.progressDotsRow}>
        {[0, 1, 2, 3].map((dot) => {
          const hidden = isRerun && dot === 0;
          if (hidden) return null;
          return <View key={dot} style={[styles.progressDot, { backgroundColor: colors.borderSubtle }, dot <= step && { backgroundColor: colors.brandPrimary }]} />;
        })}
      </View>

      <Animated.View style={[styles.card, styles.cardFlex, { opacity: contentOpacity, transform: [{ translateX: contentTranslate }] }]}>
        {step === 0 ? (
          <View style={styles.centeredStep}>
            <Animated.View style={{ transform: [{ scale: welcomeScale }] }}>
              <Image source={require('@/assets/images/logo.png')} style={styles.welcomeLogo} resizeMode="contain" />
            </Animated.View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome, {firstName}!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Let&apos;s personalize your dining experience. It&apos;ll only take a moment.</Text>
            <Pressable onPress={() => setStep(1)} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed]} testID="onboarding-next-welcome">
              <Text style={styles.primaryButtonText}>Let&apos;s Go →</Text>
            </Pressable>
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.preferencesStep}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Any dietary preferences or restrictions?</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              We&apos;ll highlight menu items that match and show cautions when items contain ingredients you avoid.
            </Text>
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              For example: are you vegetarian or vegan, do you avoid gluten, dairy, or nuts, do you keep halal, or prefer higher‑protein options?
              Turn on anything that should shape your recommendations.
            </Text>
            <ScrollView style={styles.preferenceScroll} contentContainerStyle={styles.preferenceList} showsVerticalScrollIndicator={false}>
              {ALL_DIETARY_TAGS.map((tag) => (
                <DietaryOptionRow key={tag} tag={tag} selected={selectedTags.includes(tag)} onPress={() => toggleTag(tag)} colors={colors} />
              ))}
              <Text style={[styles.optionalLabel, { color: colors.textSecondary }]}>Other (comma-separated)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.backgroundCard, borderColor: colors.borderSubtle, color: colors.textPrimary }]}
                placeholder="e.g. low sodium, no pork"
                placeholderTextColor={colors.textSecondary}
                value={otherDietaryText}
                onChangeText={setOtherDietaryText}
              />
            </ScrollView>
            <Pressable onPress={() => setStep(2)} style={({ pressed }) => [styles.primaryButton, styles.onboardingButtonSpacing, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed]} testID="onboarding-next-preferences">
              <Text style={styles.primaryButtonText}>Continue →</Text>
            </Pressable>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.preferencesStep}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Any food allergies?</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>We&apos;ll show a caution on menu items that contain these. Select all that apply.</Text>
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              For example: are you allergic to nuts, dairy, eggs, shellfish, gluten, soy, or anything else that could cause a reaction?
              Turn on anything you need Ram Café to watch out for.
            </Text>
            <ScrollView style={styles.preferenceScroll} contentContainerStyle={styles.preferenceList} showsVerticalScrollIndicator={false}>
              {ALL_ALLERGENS.map((allergen) => (
                <Pressable
                  key={allergen}
                  onPress={() => toggleAllergen(allergen)}
                  style={[styles.preferenceRow, { backgroundColor: colors.backgroundCard, borderColor: colors.borderSubtle }, selectedAllergies.includes(allergen) && { borderColor: colors.brandPrimary, borderWidth: 2, backgroundColor: `${colors.brandPrimary}1A` }]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selectedAllergies.includes(allergen) }}
                >
                  <Text style={[styles.preferenceLabel, { color: colors.textPrimary }]}>{ALLERGEN_LABELS[allergen]}</Text>
                  {selectedAllergies.includes(allergen) ? (
                    <View style={[styles.checkCircle, { backgroundColor: colors.brandPrimary }]}>
                      <Check size={14} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={[styles.checkCircleEmpty, { borderColor: colors.borderSubtle }]} />
                  )}
                </Pressable>
              ))}
              <Text style={[styles.optionalLabel, { color: colors.textSecondary }]}>Other allergies (comma-separated)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.backgroundCard, borderColor: colors.borderSubtle, color: colors.textPrimary }]}
                placeholder="e.g. sesame, kiwi"
                placeholderTextColor={colors.textSecondary}
                value={otherAllergiesText}
                onChangeText={setOtherAllergiesText}
              />
            </ScrollView>
            <Pressable onPress={() => setStep(3)} style={({ pressed }) => [styles.primaryButton, styles.onboardingButtonSpacing, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed]} testID="onboarding-next-allergies">
              <Text style={styles.primaryButtonText}>Continue →</Text>
            </Pressable>
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.centeredStep}>
            <Animated.View style={{ opacity: finalOpacity, transform: [{ scale: finalScale }] }}>
              <CheckCircle2 size={76} color={colors.accentGreen} />
            </Animated.View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>You&apos;re all set, {firstName}!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enjoy your dining experience at Ram Café.</Text>
            <Pressable onPress={handleFinish} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed]} testID="onboarding-finish-button">
              <Text style={styles.primaryButtonText}>{isRerun ? 'Save Preferences →' : 'Start Exploring →'}</Text>
            </Pressable>
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  progressDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  card: {},
  cardFlex: {
    flex: 1,
    minHeight: 0,
  },
  centeredStep: {
    alignItems: 'center',
  },
  preferencesStep: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  welcomeLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  preferenceScroll: {
    flex: 1,
    minHeight: 200,
    marginTop: 4,
  },
  preferenceList: {
    gap: 10,
    paddingBottom: 8,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    minHeight: 56,
  },
  preferenceEmoji: {
    fontSize: 22,
  },
  preferenceLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    width: '100%',
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  onboardingButtonSpacing: {
    marginTop: 20,
  },
  optionalLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
