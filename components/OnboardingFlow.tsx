import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, CheckCircle2 } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';
import { DIETARY_TAG_EMOJIS, DIETARY_TAG_LABELS, DietaryTag } from '@/types';

const ALL_DIETARY_TAGS: DietaryTag[] = ['vegetarian', 'vegan', 'glutenFree', 'highProtein', 'dairyFree', 'nutFree', 'halal'];

interface OnboardingFlowProps {
  isRerun?: boolean;
  onComplete?: () => void;
}

type OnboardingStep = 0 | 1 | 2;

function getFirstName(name?: string): string {
  const trimmed = name?.trim() ?? '';
  return trimmed.split(' ')[0] || 'Student';
}

function DietaryOptionRow({ tag, selected, onPress, colors }: { tag: DietaryTag; selected: boolean; onPress: () => void; colors: ReturnType<typeof getColors> }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
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
          selected && { borderColor: colors.brandPrimary, borderWidth: 2, backgroundColor: `${colors.brandPrimary}1A` },
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

    if (step === 2) {
      finalScale.setValue(0.5);
      finalOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(finalScale, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }),
        Animated.timing(finalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [contentOpacity, contentTranslate, finalOpacity, finalScale, step, welcomeScale]);

  const toggleTag = (tag: DietaryTag) => {
    console.log('[Onboarding] Toggling preference:', tag);
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  const handleFinish = () => {
    console.log('[Onboarding] Completing flow. isRerun:', isRerun, 'tags:', selectedTags.join(', ') || 'none');
    completeOnboarding(selectedTags);
    onComplete?.();
  };

  return (
    <View style={[styles.shell, { backgroundColor: colors.backgroundMain }]}>
      <View style={styles.progressDotsRow}>
        {[0, 1, 2].map((dot) => {
          const hidden = isRerun && dot === 0;
          if (hidden) return null;
          return <View key={dot} style={[styles.progressDot, { backgroundColor: colors.borderSubtle }, dot <= step && { backgroundColor: colors.brandPrimary }]} />;
        })}
      </View>

      <Animated.View style={[styles.card, { opacity: contentOpacity, transform: [{ translateX: contentTranslate }] }]}>
        {step === 0 ? (
          <View style={styles.centeredStep}>
            <Animated.View style={{ transform: [{ scale: welcomeScale }] }}>
              <Text style={styles.welcomeEmoji}>🍽️</Text>
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
            <Text style={[styles.title, { color: colors.textPrimary }]}>Any dietary preferences?</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>We&apos;ll use this to highlight relevant items on the menu.</Text>
            <ScrollView style={styles.preferenceScroll} contentContainerStyle={styles.preferenceList} showsVerticalScrollIndicator={false}>
              {ALL_DIETARY_TAGS.map((tag) => (
                <DietaryOptionRow key={tag} tag={tag} selected={selectedTags.includes(tag)} onPress={() => toggleTag(tag)} colors={colors} />
              ))}
            </ScrollView>
            <Pressable onPress={() => setStep(2)} style={({ pressed }) => [styles.primaryButton, styles.onboardingButtonSpacing, { backgroundColor: colors.brandPrimary }, pressed && styles.primaryButtonPressed]} testID="onboarding-next-preferences">
              <Text style={styles.primaryButtonText}>Continue →</Text>
            </Pressable>
          </View>
        ) : null}

        {step === 2 ? (
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
  centeredStep: {
    alignItems: 'center',
  },
  preferencesStep: {
    flex: 0,
  },
  welcomeEmoji: {
    fontSize: 72,
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
    marginBottom: 24,
  },
  preferenceScroll: {
    maxHeight: 380,
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
});
