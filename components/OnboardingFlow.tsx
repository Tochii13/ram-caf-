import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, CheckCircle2, Sparkles } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';
import { DIETARY_TAG_EMOJIS, DIETARY_TAG_LABELS, DietaryTag, Allergen, ALLERGEN_LABELS } from '@/types';

const ALL_DIETARY_TAGS: DietaryTag[] = ['vegetarian', 'vegan', 'glutenFree', 'highProtein', 'dairyFree', 'nutFree', 'halal'];
const ALL_ALLERGENS: Allergen[] = ['nuts', 'dairy', 'shellfish', 'gluten', 'soy', 'eggs', 'pork'];

const ALLERGEN_EMOJIS: Record<string, string> = {
  nuts: '🥜',
  dairy: '🥛',
  shellfish: '🦐',
  gluten: '🌾',
  soy: '🫘',
  eggs: '🥚',
  pork: '🥓',
};

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
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 6 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 10 }),
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

function AllergenOptionRow({ allergen, selected, onPress, colors }: { allergen: Allergen; selected: boolean; onPress: () => void; colors: ReturnType<typeof getColors> }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 6 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 10 }),
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
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
      >
        <Text style={styles.preferenceEmoji}>{ALLERGEN_EMOJIS[allergen] ?? '⚠️'}</Text>
        <Text style={[styles.preferenceLabel, { color: colors.textPrimary }]}>{ALLERGEN_LABELS[allergen]}</Text>
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

function ProgressBar({ step, totalSteps, colors }: { step: number; totalSteps: number; colors: ReturnType<typeof getColors> }) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / totalSteps,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressAnim, step, totalSteps]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressBarTrack, { backgroundColor: colors.borderSubtle }]}>
      <Animated.View style={[styles.progressBarFill, { backgroundColor: colors.brandPrimary, width }]} />
    </View>
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
  const welcomeScale = useRef(new Animated.Value(0.7)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const finalScale = useRef(new Animated.Value(0.4)).current;
  const finalOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslate = useRef(new Animated.Value(0)).current;

  const firstName = useMemo(() => getFirstName(currentUser?.name), [currentUser?.name]);

  useEffect(() => {
    contentOpacity.setValue(0.2);
    contentTranslate.setValue(20);
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(contentTranslate, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    if (step === 0) {
      welcomeScale.setValue(0.7);
      welcomeOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(welcomeScale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
        Animated.timing(welcomeOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }

    if (step === 3) {
      finalScale.setValue(0.4);
      finalOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(finalScale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
        Animated.timing(finalOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [contentOpacity, contentTranslate, finalOpacity, finalScale, step, welcomeScale, welcomeOpacity]);

  const toggleAllergen = (allergen: Allergen) => {
    setSelectedAllergies((prev) => (prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]));
  };

  const toggleTag = (tag: DietaryTag) => {
    console.log('[Onboarding] Toggling preference:', tag);
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  const handleFinish = () => {
    if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const otherA = otherAllergiesText.trim() ? otherAllergiesText.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const otherD = otherDietaryText.trim() ? otherDietaryText.split(',').map((s) => s.trim()).filter(Boolean) : [];
    completeOnboarding({ dietaryRestrictions: selectedTags, allergies: selectedAllergies, otherAllergies: otherA.length ? otherA : undefined, otherDietary: otherD.length ? otherD : undefined });
    onComplete?.();
  };

  const handleNext = (nextStep: OnboardingStep) => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(nextStep);
  };

  const isCenteredStep = step === 0 || step === 3;
  const totalSteps = isRerun ? 3 : 4;
  const currentStepIndex = isRerun ? step - 1 : step;

  return (
    <View style={[styles.shell, { backgroundColor: colors.backgroundMain, justifyContent: isCenteredStep ? 'center' : 'flex-start' }]}>
      <View style={styles.progressContainer}>
        <ProgressBar step={currentStepIndex} totalSteps={totalSteps} colors={colors} />
        <Text style={[styles.stepIndicator, { color: colors.textSecondary }]}>
          Step {currentStepIndex + 1} of {totalSteps}
        </Text>
      </View>

      <Animated.View style={[styles.card, styles.cardFlex, { opacity: contentOpacity, transform: [{ translateX: contentTranslate }] }]}>
        {step === 0 ? (
          <View style={styles.centeredStep}>
            <Animated.View style={{ transform: [{ scale: welcomeScale }], opacity: welcomeOpacity }}>
              <Image source={require('@/assets/images/logo.png')} style={styles.welcomeLogo} resizeMode="contain" />
            </Animated.View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome, {firstName}!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Let&apos;s personalize your dining experience. It&apos;ll only take a moment.</Text>
            <Pressable
              onPress={() => handleNext(1)}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed]}
              testID="onboarding-next-welcome"
            >
              <Text style={styles.primaryButtonText}>Let&apos;s Go →</Text>
            </Pressable>
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.preferencesStep}>
            <View style={[styles.stepIconWrap, { backgroundColor: colors.brandPrimaryLight }]}>
              <Sparkles size={24} color={colors.brandPrimary} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Dietary Preferences</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Select any that apply. We&apos;ll highlight matching menu items and show cautions.
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
                autoComplete="off"
                textContentType="none"
              />
            </ScrollView>
            <Pressable
              onPress={() => handleNext(2)}
              style={({ pressed }) => [styles.primaryButton, styles.onboardingButtonSpacing, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed]}
              testID="onboarding-next-preferences"
            >
              <Text style={styles.primaryButtonText}>Continue →</Text>
            </Pressable>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.preferencesStep}>
            <View style={[styles.stepIconWrap, { backgroundColor: 'rgba(230,126,34,0.12)' }]}>
              <Text style={styles.stepIconEmoji}>⚠️</Text>
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Food Allergies</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>We&apos;ll show a caution on items that contain these. Select all that apply.</Text>
            <ScrollView style={styles.preferenceScroll} contentContainerStyle={styles.preferenceList} showsVerticalScrollIndicator={false}>
              {ALL_ALLERGENS.map((allergen) => (
                <AllergenOptionRow
                  key={allergen}
                  allergen={allergen}
                  selected={selectedAllergies.includes(allergen)}
                  onPress={() => toggleAllergen(allergen)}
                  colors={colors}
                />
              ))}
              <Text style={[styles.optionalLabel, { color: colors.textSecondary }]}>Other allergies (comma-separated)</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.backgroundCard, borderColor: colors.borderSubtle, color: colors.textPrimary }]}
                placeholder="e.g. sesame, kiwi"
                placeholderTextColor={colors.textSecondary}
                value={otherAllergiesText}
                onChangeText={setOtherAllergiesText}
                autoComplete="off"
                textContentType="none"
              />
            </ScrollView>
            <Pressable
              onPress={() => handleNext(3)}
              style={({ pressed }) => [styles.primaryButton, styles.onboardingButtonSpacing, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed]}
              testID="onboarding-next-allergies"
            >
              <Text style={styles.primaryButtonText}>Continue →</Text>
            </Pressable>
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.centeredStep}>
            <Animated.View style={{ opacity: finalOpacity, transform: [{ scale: finalScale }] }}>
              <View style={[styles.completionCircle, { backgroundColor: colors.accentGreenLight }]}>
                <CheckCircle2 size={56} color={colors.accentGreen} />
              </View>
            </Animated.View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>You&apos;re all set, {firstName}!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enjoy your dining experience at Ram Café.</Text>
            <Pressable
              onPress={handleFinish}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed]}
              testID="onboarding-finish-button"
            >
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
  progressContainer: {
    marginBottom: 24,
    alignItems: 'center',
    gap: 8,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '500' as const,
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
    alignItems: 'center',
  },
  stepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  stepIconEmoji: {
    fontSize: 24,
  },
  completionCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcomeLogo: {
    width: 110,
    height: 110,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  preferenceScroll: {
    flex: 1,
    minHeight: 200,
    marginTop: 4,
    width: '100%',
  },
  preferenceList: {
    gap: 10,
    paddingBottom: 8,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    minHeight: 58,
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
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleEmpty: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    width: '100%',
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    fontSize: 16,
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
