import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Clock, Search, Star, X, Flame } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import FlowTagList from '@/components/FlowTagList';
import MenuItemCard from '@/components/MenuItemCard';
import MenuItemDetailView from '@/components/MenuItemDetailView';
import { useMenuStore } from '@/contexts/MenuStoreContext';
import { useRatingsStore } from '@/contexts/RatingsStoreContext';
import { useSession } from '@/contexts/SessionContext';
import { sampleAnnouncements, getCafeHoursForToday } from '@/mocks/data';
import { DIETARY_TAG_EMOJIS, DIETARY_TAG_LABELS, MealPeriod, MEAL_PERIOD_LABELS, MEAL_PERIOD_TIMES, MEAL_PERIOD_TIMES_WEEKDAY, MEAL_PERIOD_TIMES_WEEKEND, MenuItem } from '@/types';

type FilterOption = 'all' | MealPeriod;

const FILTERS_WEEKDAY: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
];

const FILTERS_WEEKEND: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'brunch', label: 'Brunch' },
  { key: 'dinner', label: 'Dinner' },
];

function getTimeRangeForPeriod(period: MealPeriod, isWeekend: boolean): string {
  if (isWeekend && (period === 'brunch' || period === 'dinner')) return MEAL_PERIOD_TIMES_WEEKEND[period].timeRange;
  if (period in MEAL_PERIOD_TIMES_WEEKDAY) return MEAL_PERIOD_TIMES_WEEKDAY[period as keyof typeof MEAL_PERIOD_TIMES_WEEKDAY].timeRange;
  return MEAL_PERIOD_TIMES[period].timeRange;
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good Morning, ${name}!`;
  if (hour >= 12 && hour < 17) return `Good Afternoon, ${name}!`;
  return `Good Evening, ${name}!`;
}

function getDayName(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatCountdown(totalMinutes: number): string {
  const safeMinutes = Math.max(totalMinutes, 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatCountdownLong(totalMinutes: number): string {
  const safeMinutes = Math.max(totalMinutes, 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
}

function getMinutesUntil(targetHourDecimal: number): number {
  const now = new Date();
  const minsFromMidnight = now.getHours() * 60 + now.getMinutes();
  const targetMins = Math.floor(targetHourDecimal) * 60 + (targetHourDecimal % 1) * 60;
  return Math.max(0, Math.round(targetMins - minsFromMidnight));
}

function getCountdownState(): { message: string; highlight?: string; accessibilityMessage: string } {
  const d = new Date();
  const hour = d.getHours() + d.getMinutes() / 60;
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const periods: MealPeriod[] = isWeekend ? ['brunch', 'dinner'] : ['breakfast', 'lunch', 'dinner'];
  const times = isWeekend ? MEAL_PERIOD_TIMES_WEEKEND : MEAL_PERIOD_TIMES_WEEKDAY;

  for (const period of periods) {
    const range = times[period as keyof typeof times];
    if (!range) continue;
    if (hour >= range.startHour && hour < range.endHour) {
      const mins = getMinutesUntil(range.endHour);
      return {
        message: `${MEAL_PERIOD_LABELS[period]} closes in `,
        highlight: formatCountdown(mins),
        accessibilityMessage: `${MEAL_PERIOD_LABELS[period]} closes in ${formatCountdownLong(mins)}.`,
      };
    }
    if (hour < range.startHour) {
      const mins = getMinutesUntil(range.startHour);
      return {
        message: `${MEAL_PERIOD_LABELS[period]} opens in `,
        highlight: formatCountdown(mins),
        accessibilityMessage: `${MEAL_PERIOD_LABELS[period]} opens in ${formatCountdownLong(mins)}.`,
      };
    }
  }

  const tomorrow = new Date(d);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDay();
  const isTomorrowWeekend = tomorrowDay === 0 || tomorrowDay === 6;
  const nextOpen = isTomorrowWeekend ? 'Brunch opens at 11:00 AM' : 'Breakfast opens at 7:00 AM';
  return {
    message: `See you tomorrow! ${nextOpen}`,
    accessibilityMessage: `All meals are closed for today. ${nextOpen} tomorrow.`,
  };
}

function getUnratedPeriod(ratedPeriods: Set<string>): MealPeriod | null {
  const dateKey = getDateKey(new Date());
  const d = new Date();
  const hour = d.getHours() + d.getMinutes() / 60;
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const candidates: MealPeriod[] = isWeekend ? ['dinner', 'brunch'] : ['dinner', 'lunch', 'breakfast'];
  const times = isWeekend ? MEAL_PERIOD_TIMES_WEEKEND : MEAL_PERIOD_TIMES_WEEKDAY;
  return candidates.find((period) => {
    const range = times[period as keyof typeof times];
    return range && hour >= range.endHour && !ratedPeriods.has(`${dateKey}-${period}`);
  }) ?? null;
}

function AnimatedSection({ delay, children }: { delay: number; children: React.ReactNode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
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

function RecommendationCard({ item, colors, highContrast, index }: { item: MenuItem; colors: ReturnType<typeof getColors>; highContrast: boolean; index: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: index * 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay: index * 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
      <Pressable
        onPressIn={() => {
          Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
          if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
        }}
      >
        <View style={[styles.recommendationCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
          <View style={[styles.recommendationAccent, { backgroundColor: colors.brandPrimary }]} accessible={false} />
          <View style={[styles.recommendationEmojiWrap, { backgroundColor: colors.surfaceTimeBlock }]} accessible={false}>
            <Text style={styles.recommendationEmoji}>{item.emoji}</Text>
          </View>
          <Text style={[styles.recommendationName, { color: colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
          <View style={styles.recommendationCalRow}>
            <Flame size={12} color={colors.accentGold} />
            <Text style={[styles.recommendationCalories, { color: colors.textSecondary }]}>{item.calories} cal</Text>
          </View>
          <FlowTagList style={styles.recommendationTagsWrap}>
            {item.dietaryTags.slice(0, 2).map((tag) => (
              <View key={tag} style={[styles.recommendationTagPill, highContrast ? { backgroundColor: colors.brandPrimary } : { backgroundColor: colors.brandPrimaryMedium }]}>
                <Text style={[styles.recommendationTagText, { color: highContrast ? '#FFFFFF' : colors.brandPrimary }]}>
                  {DIETARY_TAG_EMOJIS[tag]} {DIETARY_TAG_LABELS[tag]}
                </Text>
              </View>
            ))}
          </FlowTagList>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function PulsingDot({ color }: { color: string }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.6, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.pulsingDotContainer}>
      <Animated.View style={[styles.pulsingDotOuter, { backgroundColor: color, opacity: 0.3, transform: [{ scale: pulseAnim }] }]} />
      <View style={[styles.pulsingDotInner, { backgroundColor: color }]} />
    </View>
  );
}

function RatingSheetView({
  visible,
  mealPeriod,
  items,
  onSubmit,
  onSkip,
}: {
  visible: boolean;
  mealPeriod: MealPeriod | null;
  items: MenuItem[];
  onSubmit: (ratings: Record<string, number>) => void;
  onSkip: () => void;
}) {
  const { resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!visible) setSelectedRatings({});
  }, [visible]);

  const handleStarPress = useCallback((itemId: string, star: number) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedRatings((prev) => ({ ...prev, [itemId]: star }));
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onSkip}>
      <View style={[styles.sheetOverlay, { backgroundColor: colors.overlayBg }]}>
        <View style={[styles.sheetCard, { backgroundColor: colors.backgroundCard }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.borderSubtle }]} />
          <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>How was {mealPeriod ? MEAL_PERIOD_LABELS[mealPeriod] : 'your meal'}?</Text>
          <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>Rate the items you tried today.</Text>
          {items.length === 0 ? (
            <Text style={[styles.sheetEmpty, { color: colors.textSecondary }]}>Nothing to rate for this period.</Text>
          ) : (
            <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetListContent}>
              {items.map((item) => (
                <View key={item.id} style={[styles.ratingRow, { borderBottomColor: colors.borderSubtle }]}>
                  <View style={styles.ratingItemRow}>
                    <View style={[styles.ratingEmojiWrap, { backgroundColor: colors.surfaceTimeBlock }]}>
                      <Text style={styles.ratingEmoji}>{item.emoji}</Text>
                    </View>
                    <Text style={[styles.ratingItemName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const selected = (selectedRatings[item.id] ?? 0) >= star;
                      return (
                        <Pressable
                          key={star}
                          onPress={() => handleStarPress(item.id, star)}
                          hitSlop={6}
                          testID={`rate-${item.id}-${star}`}
                          accessibilityLabel={`${star} star${star > 1 ? 's' : ''} for ${item.name}`}
                          accessibilityRole="button"
                          style={styles.starButton}
                        >
                          <Star size={24} color={selected ? colors.accentGold : colors.borderSubtle} fill={selected ? colors.accentGold : 'transparent'} />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
          {items.length > 0 ? (
            <Pressable onPress={() => onSubmit(selectedRatings)} style={({ pressed }) => [styles.sheetPrimaryButton, { backgroundColor: colors.brandPrimary }, pressed && styles.sheetPrimaryButtonPressed]} testID="submit-ratings-button">
              <Text style={styles.sheetPrimaryButtonText}>Submit Ratings</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onSkip} style={styles.sheetSecondaryButton} testID="skip-ratings-button">
            <Text style={[styles.sheetSecondaryText, { color: colors.textSecondary }]}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function FilterChip({ label, selected, onPress, colors, testID }: { label: string; selected: boolean; onPress: () => void; colors: ReturnType<typeof getColors>; testID: string }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgAnim, { toValue: selected ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [selected, bgAnim]);

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.backgroundCard, colors.brandPrimary],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={() => {
          Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
        }}
        onPress={onPress}
        testID={testID}
        accessibilityLabel={`${label} filter`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Animated.View style={[styles.chip, { backgroundColor, shadowColor: selected ? 'transparent' : colors.shadow }]}>
          <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.textSecondary }]}>{label}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, effectiveDietaryTags, resolvedColorScheme, highContrastEnabled, textSizeMultiplier } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const { menuItems } = useMenuStore();
  const { submitRating, ratedPeriods, markPeriodRated } = useRatingsStore();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [countdownMessage, setCountdownMessage] = useState(getCountdownState());
  const [showRatingSheet, setShowRatingSheet] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const firstAnnouncement = sampleAnnouncements[0];
  const firstName = currentUser?.name?.trim().split(' ')[0] ?? 'Student';
  const cafeHours = getCafeHoursForToday();

  const greetingFade = useRef(new Animated.Value(0)).current;
  const greetingSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(greetingFade, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(greetingSlide, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [greetingFade, greetingSlide]);

  const isWeekend = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  }, []);
  const filtersForToday = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 || day === 6 ? FILTERS_WEEKEND : FILTERS_WEEKDAY;
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const visiblePeriods = useMemo<MealPeriod[]>(() => {
    if (filter === 'all') return isWeekend ? ['brunch', 'dinner'] : ['breakfast', 'lunch', 'dinner'];
    if (filter === 'brunch') return ['breakfast', 'lunch'];
    return [filter];
  }, [filter, isWeekend]);

  const menuByPeriod = useMemo(() => {
    const map: Record<string, MenuItem[]> = { breakfast: [], lunch: [], dinner: [], brunch: [] };
    menuItems.forEach((item) => map[item.mealPeriod].push(item));
    if (isWeekend) map.brunch = [...(map.breakfast ?? []), ...(map.lunch ?? [])];
    return map;
  }, [menuItems, isWeekend]);

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.trim().toLowerCase();
    return menuItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [isSearching, menuItems, searchQuery]);

  const pickedForYou = useMemo(() => {
    if (effectiveDietaryTags.length === 0) return [];
    return menuItems.filter((item) => item.dietaryTags.some((tag) => effectiveDietaryTags.includes(tag))).slice(0, 3);
  }, [effectiveDietaryTags, menuItems]);

  const isAnyPeriodOpen = cafeHours.some((item) => item.isOpenNow);
  const unratedPeriod = useMemo(() => getUnratedPeriod(ratedPeriods), [ratedPeriods]);

  const ratingItems = useMemo(() => {
    if (!unratedPeriod) return [];
    if (unratedPeriod === 'brunch') return menuItems.filter((item) => item.mealPeriod === 'breakfast' || item.mealPeriod === 'lunch');
    return menuItems.filter((item) => item.mealPeriod === unratedPeriod);
  }, [menuItems, unratedPeriod]);

  useEffect(() => {
    setCountdownMessage(getCountdownState());
    const timer = setInterval(() => setCountdownMessage(getCountdownState()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmitRatings = useCallback((ratings: Record<string, number>) => {
    if (!unratedPeriod) return;
    const date = new Date();
    const periodKey = `${getDateKey(date)}-${unratedPeriod}`;
    ratingItems.forEach((item) => {
      const stars = ratings[item.id] ?? 0;
      if (stars > 0) {
        submitRating({
          id: `rating-${item.id}-${Date.now()}`,
          menuItemID: item.id,
          menuItemName: item.name,
          stars,
          mealPeriod: unratedPeriod,
          date,
        });
      }
    });
    markPeriodRated(periodKey);
    setShowRatingSheet(false);
  }, [markPeriodRated, ratingItems, submitRating, unratedPeriod]);

  const handleSkipRatings = useCallback(() => {
    if (unratedPeriod) markPeriodRated(`${getDateKey(new Date())}-${unratedPeriod}`);
    setShowRatingSheet(false);
  }, [markPeriodRated, unratedPeriod]);

  const handleFilterPress = useCallback((key: FilterOption) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFilter(key);
  }, []);

  const searchBarScale = useRef(new Animated.Value(1)).current;

  return (
    <>
      <ScrollView style={[styles.scroll, { backgroundColor: colors.backgroundMain }]} contentContainerStyle={[styles.scrollContent, { paddingTop: 16 + Math.max(insets.top, 12) }]} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.greetingSection, { opacity: greetingFade, transform: [{ translateY: greetingSlide }] }]}>
          <Text style={[styles.greeting, { color: colors.textPrimary, fontSize: 28 * textSizeMultiplier }]}>{getGreeting(firstName)}</Text>
          <Text style={[styles.dateSubline, { color: colors.textSecondary, fontSize: 15 * textSizeMultiplier }]}>{getDayName()}</Text>
        </Animated.View>

        <AnimatedSection delay={100}>
          <Animated.View style={{ transform: [{ scale: searchBarScale }] }}>
            <View style={[styles.searchBar, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
              <Search size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search menu items..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => Animated.spring(searchBarScale, { toValue: 1.02, useNativeDriver: true, speed: 50, bounciness: 6 }).start()}
                onBlur={() => Animated.spring(searchBarScale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start()}
                accessibilityLabel="Search menu items"
                testID="menu-search-input"
              />
              {isSearching ? (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8} accessibilityLabel="Clear search" accessibilityRole="button">
                  <X size={18} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          </Animated.View>
        </AnimatedSection>

        {isSearching ? (
          <AnimatedSection delay={0}>
            <View style={styles.searchResults}>
              {searchResults.length === 0 ? (
                <View style={styles.emptySearch}>
                  <Search size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptySearchText, { color: colors.textPrimary }]}>No items match your search.</Text>
                </View>
              ) : (
                searchResults.map((item) => (
                  <MenuItemCard key={item.id} item={item} onPress={() => setSelectedItem(item)} />
                ))
              )}
            </View>
          </AnimatedSection>
        ) : (
          <>
            {firstAnnouncement ? (
              <AnimatedSection delay={180}>
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/announcements');
                  }}
                  testID="announcement-banner"
                  accessibilityLabel={`Announcement: ${firstAnnouncement.title}.`}
                  accessibilityHint="Tap to view all announcements."
                  accessibilityRole="button"
                >
                  <View style={[styles.announcementCard, { backgroundColor: colors.brandPrimaryLight, borderColor: colors.brandPrimaryMedium }]}>
                    <View style={styles.announcementInner}>
                      <View style={[styles.announcementIcon, { backgroundColor: colors.brandPrimaryMedium }]}>
                        <Text style={styles.announcementIconText}>📢</Text>
                      </View>
                      <View style={styles.announcementContent}>
                        <Text style={[styles.announcementTitle, { color: colors.brandPrimary }]}>{firstAnnouncement.title}</Text>
                        <Text style={[styles.announcementExcerpt, { color: colors.textSecondary }]} numberOfLines={1}>{firstAnnouncement.content}</Text>
                      </View>
                      <ChevronRight size={18} color={colors.brandPrimary} />
                    </View>
                  </View>
                </Pressable>
              </AnimatedSection>
            ) : null}

            <AnimatedSection delay={260}>
              <View style={[styles.hoursCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
                <View style={styles.hoursHeader}>
                  <View style={styles.hoursHeaderLeft}>
                    <View style={[styles.hoursIconWrap, { backgroundColor: colors.brandPrimaryLight }]}>
                      <Clock size={16} color={colors.brandPrimary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today&apos;s Hours</Text>
                  </View>
                  {isAnyPeriodOpen ? (
                    <View style={[styles.openBadge, { backgroundColor: colors.accentGreen }]}>
                      <PulsingDot color="#FFFFFF" />
                      <Text style={styles.openBadgeText} accessibilityLabel="Open Now">Open</Text>
                    </View>
                  ) : null}
                </View>
                {cafeHours.map((period, i) => (
                  <View
                    key={period.mealPeriod}
                    style={[styles.hourRow, i < cafeHours.length - 1 && { borderBottomColor: colors.borderSubtle, borderBottomWidth: 0.5 }]}
                    accessibilityLabel={`${MEAL_PERIOD_LABELS[period.mealPeriod]}. ${period.startTime} to ${period.endTime}. ${period.isOpenNow ? 'Open now.' : 'Closed.'}`}
                  >
                    <View style={[styles.periodPill, { backgroundColor: period.isOpenNow ? colors.accentGreenLight : colors.surfaceTimeBlock }]}>
                      <Text style={[styles.periodPillText, { color: period.isOpenNow ? colors.accentGreen : colors.textPrimary }]}>{MEAL_PERIOD_LABELS[period.mealPeriod]}</Text>
                    </View>
                    <Text style={[styles.timeRange, { color: colors.textSecondary }]}>{period.startTime} – {period.endTime}</Text>
                    {period.isOpenNow ? <View style={[styles.openDot, { backgroundColor: colors.accentGreen }]} /> : null}
                  </View>
                ))}
              </View>
            </AnimatedSection>

            <AnimatedSection delay={340}>
              <View style={[styles.countdownCard, { backgroundColor: colors.brandPrimaryLight, borderLeftColor: colors.brandPrimary, borderLeftWidth: 3 }]}>
                <Clock size={16} color={colors.brandPrimary} />
                <Text
                  style={[styles.countdownText, { color: colors.textPrimary }]}
                  accessibilityLabel={countdownMessage.accessibilityMessage}
                  accessibilityRole="text"
                >
                  {countdownMessage.message}
                  {countdownMessage.highlight ? <Text style={[styles.countdownHighlight, { color: colors.brandPrimary }]}>{countdownMessage.highlight}</Text> : null}
                </Text>
              </View>
            </AnimatedSection>

            {unratedPeriod ? (
              <AnimatedSection delay={400}>
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowRatingSheet(true);
                  }}
                  testID="rating-banner"
                  accessibilityLabel={`Rate ${MEAL_PERIOD_LABELS[unratedPeriod]}. Tap to leave a rating.`}
                  accessibilityHint={`Opens the rating screen for today's ${MEAL_PERIOD_LABELS[unratedPeriod].toLowerCase()} items.`}
                  accessibilityRole="button"
                >
                  <View style={[styles.ratingBanner, { backgroundColor: colors.accentGoldLight, borderLeftColor: colors.accentGold, borderLeftWidth: 3 }]}>
                    <View style={styles.ratingBannerInner}>
                      <Star size={20} color={colors.accentGold} fill={colors.accentGold} />
                      <Text style={[styles.ratingBannerText, { color: colors.textPrimary }]}>
                        How was {MEAL_PERIOD_LABELS[unratedPeriod]}? Tap to rate.
                      </Text>
                      <ChevronRight size={18} color={colors.textSecondary} />
                    </View>
                  </View>
                </Pressable>
              </AnimatedSection>
            ) : null}

            {pickedForYou.length > 0 ? (
              <AnimatedSection delay={460}>
                <View style={styles.pickedSection}>
                  <View style={styles.pickedHeader}>
                    <Text style={[styles.pickedTitle, { color: colors.textPrimary }]}>Picked for You</Text>
                    <View style={[styles.pickedBadge, { backgroundColor: colors.brandPrimaryLight }]}>
                      <Text style={[styles.pickedBadgeText, { color: colors.brandPrimary }]}>✨ Personalized</Text>
                    </View>
                  </View>
                  <Text style={[styles.pickedSubtitle, { color: colors.textSecondary }]}>Based on your dietary preferences</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationRow}>
                    {pickedForYou.map((item, index) => (
                      <RecommendationCard key={item.id} item={item} colors={colors} highContrast={highContrastEnabled} index={index} />
                    ))}
                  </ScrollView>
                </View>
              </AnimatedSection>
            ) : null}

            <AnimatedSection delay={540}>
              <View style={styles.menuHeader}>
                <Text style={[styles.menuSectionTitle, { color: colors.textPrimary, fontSize: 20 * textSizeMultiplier }]}>Today&apos;s Menu</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
                {filtersForToday.map((f) => (
                  <FilterChip
                    key={f.key}
                    label={f.label}
                    selected={filter === f.key}
                    onPress={() => handleFilterPress(f.key)}
                    colors={colors}
                    testID={`filter-${f.key}`}
                  />
                ))}
              </ScrollView>
            </AnimatedSection>

            <AnimatedSection delay={620}>
              {visiblePeriods.map((period) => {
                const items = menuByPeriod[period];
                if (items.length === 0) return null;
                return (
                  <View key={period} style={styles.periodSection}>
                    <View style={styles.periodHeader}>
                      <View style={styles.periodNameRow}>
                        <View style={[styles.periodDot, { backgroundColor: colors.brandPrimary }]} />
                        <Text style={[styles.periodName, { color: colors.textPrimary }]}>{MEAL_PERIOD_LABELS[period]}</Text>
                      </View>
                      <Text style={[styles.periodTime, { color: colors.textSecondary }]}>{getTimeRangeForPeriod(period, isWeekend)}</Text>
                    </View>
                    {items.map((item) => (
                      <MenuItemCard key={item.id} item={item} onPress={() => setSelectedItem(item)} />
                    ))}
                  </View>
                );
              })}
            </AnimatedSection>
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      <RatingSheetView visible={showRatingSheet} mealPeriod={unratedPeriod} items={ratingItems} onSubmit={handleSubmitRatings} onSkip={handleSkipRatings} />

      <Modal visible={selectedItem !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedItem(null)}>
        <View style={[styles.detailModalShell, { backgroundColor: colors.backgroundMain }]}>
          <View style={[styles.detailModalHeader, { borderBottomColor: colors.borderSubtle }]}>
            <Pressable onPress={() => setSelectedItem(null)} accessibilityLabel="Close details" accessibilityRole="button" style={({ pressed }) => [styles.detailCloseButton, { backgroundColor: colors.surfaceTimeBlock }, pressed && { opacity: 0.6 }]}>
              <X size={18} color={colors.textPrimary} />
            </Pressable>
            <Text style={[styles.detailModalTitle, { color: colors.textPrimary }]}>Details</Text>
            <View style={styles.detailHeaderSpacer} />
          </View>
          {selectedItem ? <MenuItemDetailView item={selectedItem} /> : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greetingSection: {
    marginBottom: 22,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
  },
  dateSubline: {
    fontSize: 15,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 10,
    minHeight: 50,
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
  },
  searchResults: {
    marginBottom: 16,
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptySearchText: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  announcementCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  announcementInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  announcementIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementIconText: {
    fontSize: 18,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  announcementExcerpt: {
    fontSize: 13,
    marginTop: 2,
  },
  hoursCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
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
  hoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  hoursHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hoursIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  openBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  pulsingDotContainer: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsingDotOuter: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pulsingDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 10,
  },
  periodPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 88,
    alignItems: 'center',
  },
  periodPillText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  timeRange: {
    fontSize: 14,
    flex: 1,
  },
  openDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
  },
  countdownText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  countdownHighlight: {
    fontWeight: '700' as const,
  },
  ratingBanner: {
    marginBottom: 14,
    overflow: 'hidden' as const,
    borderRadius: 14,
  },
  ratingBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  ratingBannerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  pickedSection: {
    marginBottom: 22,
  },
  pickedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickedTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  pickedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pickedBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  pickedSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  recommendationRow: {
    gap: 12,
    paddingRight: 16,
  },
  recommendationCard: {
    width: 170,
    minHeight: 200,
    padding: 14,
    alignItems: 'center',
    overflow: 'hidden' as const,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
      web: {
        shadowOpacity: 0.1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  recommendationAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  recommendationEmojiWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  recommendationEmoji: {
    fontSize: 26,
  },
  recommendationName: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600' as const,
    minHeight: 40,
    letterSpacing: -0.2,
  },
  recommendationCalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  recommendationCalories: {
    fontSize: 13,
  },
  recommendationTagsWrap: {
    justifyContent: 'center',
    marginTop: 10,
  },
  recommendationTagPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recommendationTagText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  chipScroll: {
    marginBottom: 16,
    flexGrow: 0,
  },
  chipRow: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    minHeight: 42,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
      web: {
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
    }),
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  periodSection: {
    marginBottom: 18,
  },
  periodHeader: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  periodName: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  periodTime: {
    fontSize: 13,
  },
  bottomPad: {
    height: 24,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    minHeight: 320,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  sheetList: {
    maxHeight: 320,
  },
  sheetListContent: {
    gap: 4,
  },
  ratingRow: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  ratingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  ratingEmojiWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingEmoji: {
    fontSize: 16,
  },
  ratingItemName: {
    fontSize: 15,
    fontWeight: '500' as const,
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingLeft: 42,
  },
  starButton: {
    padding: 2,
  },
  sheetPrimaryButton: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetPrimaryButtonPressed: {
    opacity: 0.86,
  },
  sheetPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  sheetSecondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 8,
  },
  sheetSecondaryText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  sheetEmpty: {
    fontSize: 14,
    paddingVertical: 20,
    textAlign: 'center',
  },
  detailModalShell: {
    flex: 1,
  },
  detailModalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailModalTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  detailHeaderSpacer: {
    width: 36,
  },
});
