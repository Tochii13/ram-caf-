import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import { t, tMealPeriod, tFood, tFoodDesc, tDay } from '@/constants/i18n';
import FlowTagList from '@/components/FlowTagList';
import { useMenuStore } from '@/contexts/MenuStoreContext';
import { useSession } from '@/contexts/SessionContext';
import {
  ALLERGEN_LABELS,
  Allergen,
  DIETARY_TAG_EMOJIS,
  DIETARY_TAG_LABELS,
  MealPeriod,
  MEAL_PERIOD_TIMES,
  MEAL_PERIOD_TIMES_WEEKDAY,
  MEAL_PERIOD_TIMES_WEEKEND,
  MenuItem,
  WeeklyMenuItem,
} from '@/types';

function getTimeRangeForPeriod(period: MealPeriod, isWeekend: boolean): string {
  if (isWeekend && (period === 'brunch' || period === 'dinner')) return MEAL_PERIOD_TIMES_WEEKEND[period].timeRange;
  if (period in MEAL_PERIOD_TIMES_WEEKDAY) return MEAL_PERIOD_TIMES_WEEKDAY[period as keyof typeof MEAL_PERIOD_TIMES_WEEKDAY].timeRange;
  return MEAL_PERIOD_TIMES[period].timeRange;
}

const PERIOD_EMOJI: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  brunch: '🍳',
};

function WeeklyMenuItemRow({
  item,
  colors,
  highContrast,
  allergens,
  index,
}: {
  item: WeeklyMenuItem;
  colors: ReturnType<typeof getColors>;
  highContrast: boolean;
  allergens?: Allergen[];
  index: number;
}) {
  const { effectiveAllergies, appLanguage } = useSession();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 60, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const warningAllergens = useMemo<Allergen[]>(() => {
    if (!allergens || allergens.length === 0 || effectiveAllergies.length === 0) return [];
    return allergens.filter((a) => effectiveAllergies.includes(a));
  }, [allergens, effectiveAllergies]);

  const warningText = useMemo(
    () => warningAllergens.map((a) => ALLERGEN_LABELS[a]).join(', '),
    [warningAllergens],
  );

  const showCaution = warningAllergens.length > 0;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View
        style={styles.menuRow}
        accessible
        accessibilityLabel={`${item.name}, ${item.calories} calories. ${item.description || ''}. ${item.dietaryTags.map((t) => DIETARY_TAG_LABELS[t]).join(', ')}`}
      >
        <View style={styles.menuRowTop}>
          <View style={[styles.menuEmojiSquare, { backgroundColor: colors.surfaceTimeBlock }]} accessible={false}>
            <Text style={styles.menuEmoji}>{item.emoji}</Text>
          </View>
          <View style={styles.menuRowContent}>
            <View style={styles.menuNameRow}>
              <Text style={[styles.menuName, { color: colors.textPrimary }]} numberOfLines={1}>{tFood(appLanguage, item.name)}</Text>
              <Text style={[styles.menuCalories, { color: colors.textSecondary }]}>{item.calories} cal</Text>
            </View>
            {item.description ? (
              <Text style={[styles.menuDescription, { color: colors.textSecondary }]} numberOfLines={2}>{tFoodDesc(appLanguage, item.name, item.description)}</Text>
            ) : null}
            {item.dietaryTags.length > 0 ? (
              <FlowTagList style={styles.tagsWrap}>
                {item.dietaryTags.map((tag) => (
                  <View
                    key={tag}
                    style={[
                      styles.tagPill,
                      highContrast
                        ? { backgroundColor: colors.brandPrimary }
                        : { backgroundColor: colors.brandPrimaryMedium },
                    ]}
                  >
                    <Text style={[styles.tagPillText, { color: highContrast ? '#FFFFFF' : colors.brandPrimary }]}>
                      {DIETARY_TAG_EMOJIS[tag]} {DIETARY_TAG_LABELS[tag]}
                    </Text>
                  </View>
                ))}
              </FlowTagList>
            ) : null}
            {showCaution ? (
              <View style={[styles.menuWarningRow, { backgroundColor: 'rgba(230,126,34,0.08)' }]}>
                <Text
                  style={[
                    styles.menuWarningText,
                    highContrast && styles.menuWarningTextHighContrast,
                  ]}
                >
                  ⚠️ {t(appLanguage, 'contains')} {warningText}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function DayCard({
  day,
  _index,
  selected,
  isToday,
  onPress,
  colors,
}: {
  day: { id: string; weekday: string; dateLabel: string };
  _index: number;
  selected: boolean;
  isToday: boolean;
  onPress: () => void;
  colors: ReturnType<typeof getColors>;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dateNum = day.dateLabel.split(' ')[1] ?? '';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={() => {
          Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
        }}
        onPress={onPress}
        style={[
          styles.dayCardTop,
          {
            backgroundColor: selected ? colors.brandPrimary : colors.backgroundCard,
            shadowColor: colors.shadow,
          },
          selected && styles.dayCardSelected,
        ]}
        accessibilityLabel={`${day.weekday}, ${day.dateLabel}`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <Text style={[styles.dayCardTopWeekday, { color: selected ? 'rgba(255,255,255,0.75)' : colors.textSecondary }]}>
          {day.weekday.slice(0, 3).toUpperCase()}
        </Text>
        <Text style={[styles.dayCardTopDate, { color: selected ? '#FFFFFF' : colors.textPrimary }]}>{dateNum}</Text>
        {isToday && !selected ? (
          <View style={[styles.todayDot, { backgroundColor: colors.brandPrimary }]} />
        ) : isToday && selected ? (
          <View style={[styles.todayDot, { backgroundColor: '#FFFFFF' }]} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export default function WeeklyScreen() {
  const { weeklyDays, menuItems } = useMenuStore();
  const { resolvedColorScheme, highContrastEnabled, appLanguage } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const contentFade = useRef(new Animated.Value(1)).current;
  const contentSlide = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [headerFade]);

  const baseItemsByName = useMemo(() => {
    const map: Record<string, MenuItem> = {};
    menuItems.forEach((item) => {
      map[item.name.toLowerCase()] = item;
    });
    return map;
  }, [menuItems]);

  useEffect(() => {
    const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const foundIndex = weeklyDays.findIndex((item) => item.weekday === weekday);
    setSelectedIndex(foundIndex >= 0 ? foundIndex : 0);
  }, [weeklyDays]);

  const animateContentChange = () => {
    contentFade.setValue(0);
    contentSlide.setValue(16);
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  const handleSelectDay = (index: number) => {
    if (index === selectedIndex) return;
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIndex(index);
    animateContentChange();
  };

  const handlePrev = () => {
    if (selectedIndex > 0) handleSelectDay(selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex < weeklyDays.length - 1) handleSelectDay(selectedIndex + 1);
  };

  const selectedDay = weeklyDays[selectedIndex] ?? weeklyDays[0];

  return (
    <View style={[styles.screen, { backgroundColor: colors.backgroundMain }]}>
      <Animated.View style={[styles.dayStripContainer, { opacity: headerFade }]}>
        <Pressable
          onPress={handlePrev}
          style={[styles.arrowButton, { opacity: selectedIndex > 0 ? 1 : 0.3 }]}
          disabled={selectedIndex === 0}
          accessibilityLabel="Previous day"
          accessibilityRole="button"
          hitSlop={8}
        >
          <View style={[styles.arrowCircle, { backgroundColor: colors.surfaceTimeBlock }]}>
            <ChevronLeft size={18} color={colors.textSecondary} />
          </View>
        </Pressable>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStripContent}
          style={styles.dayStrip}
        >
          {weeklyDays.map((day, index) => {
            const selected = index === selectedIndex;
            const isToday = day.weekday === new Date().toLocaleDateString('en-US', { weekday: 'long' });
            return (
              <DayCard
                key={day.id}
                day={day}
                _index={index}
                selected={selected}
                isToday={isToday}
                onPress={() => handleSelectDay(index)}
                colors={colors}
              />
            );
          })}
        </ScrollView>
        <Pressable
          onPress={handleNext}
          style={[styles.arrowButton, { opacity: selectedIndex < weeklyDays.length - 1 ? 1 : 0.3 }]}
          disabled={selectedIndex >= weeklyDays.length - 1}
          accessibilityLabel="Next day"
          accessibilityRole="button"
          hitSlop={8}
        >
          <View style={[styles.arrowCircle, { backgroundColor: colors.surfaceTimeBlock }]}>
            <ChevronRight size={18} color={colors.textSecondary} />
          </View>
        </Pressable>
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {selectedDay ? (() => {
          const isWeekendDay = ['Saturday', 'Sunday'].includes(selectedDay.weekday);
          const periods = isWeekendDay ? (['brunch', 'dinner'] as const) : (['breakfast', 'lunch', 'dinner'] as const);
          const dayItemsByPeriod: Record<string, WeeklyMenuItem[]> = { breakfast: [], lunch: [], dinner: [], brunch: [] };
          selectedDay.items.forEach((item) => dayItemsByPeriod[item.mealPeriod].push(item));
          if (isWeekendDay) dayItemsByPeriod.brunch = [...dayItemsByPeriod.breakfast, ...dayItemsByPeriod.lunch];
          return (
            <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}>
              <View style={styles.weekTitleRow}>
                <Text style={[styles.weekTitle, { color: colors.textSecondary }]}>
                  {tDay(appLanguage, selectedDay.weekday)} · {selectedDay.dateLabel}
                </Text>
              </View>
              {periods.map((period) => {
                const items = dayItemsByPeriod[period] ?? [];
                const timeRange = getTimeRangeForPeriod(period, isWeekendDay);
                return (
                  <View key={period} style={[styles.periodCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
                    <View style={[styles.periodTop, { backgroundColor: colors.surfaceTimeBlock }]}>
                      <View style={styles.periodTitleRow}>
                        <Text style={styles.periodEmoji}>{PERIOD_EMOJI[period] ?? '🍽️'}</Text>
                        <Text style={[styles.periodTitle, { color: colors.textPrimary }]}>{tMealPeriod(appLanguage, period)}</Text>
                      </View>
                      <View style={[styles.periodTimeBadge, { backgroundColor: colors.backgroundCard }]}>
                        <Text style={[styles.periodTime, { color: colors.textSecondary }]}>{timeRange}</Text>
                      </View>
                    </View>
                    <View style={styles.periodBody}>
                      {items.map((item, i) => {
                        const base = baseItemsByName[item.name.toLowerCase()];
                        return (
                          <View
                            key={item.id}
                            style={[
                              styles.periodRowWrap,
                              i < items.length - 1 && {
                                borderBottomWidth: 0.5,
                                borderBottomColor: colors.borderSubtle,
                              },
                            ]}
                          >
                            <WeeklyMenuItemRow
                              item={item}
                              colors={colors}
                              highContrast={highContrastEnabled}
                              allergens={base?.allergens}
                              index={i}
                            />
                          </View>
                        );
                      })}
                      {items.length === 0 ? (
                        <View style={styles.emptyPeriodWrap}>
                          <Text style={styles.emptyPeriodEmoji}>🍽️</Text>
                          <Text style={[styles.emptyPeriodText, { color: colors.textSecondary }]}>{t(appLanguage, 'noItemsPlanned')}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={[styles.periodItemCount, { backgroundColor: colors.surfaceTimeBlock }]}>
                      <Text style={[styles.periodItemCountText, { color: colors.textSecondary }]}>{items.length} {items.length !== 1 ? t(appLanguage, 'items') : t(appLanguage, 'item')}</Text>
                    </View>
                  </View>
                );
              })}
              <View style={styles.bottomPad} />
            </Animated.View>
          );
        })() : (
          <Text style={[styles.emptyPeriodText, { color: colors.textSecondary }]}>{t(appLanguage, 'selectDay')}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  dayStripContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  arrowButton: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayStrip: {
    flex: 1,
  },
  dayStripContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  dayCardTop: {
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
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
  dayCardSelected: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
      web: {
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  dayCardTopWeekday: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  dayCardTopDate: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  weekTitleRow: {
    marginBottom: 16,
  },
  weekTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  periodCard: {
    marginBottom: 16,
    overflow: 'hidden' as const,
    borderRadius: 18,
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
  periodTop: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodEmoji: {
    fontSize: 18,
  },
  periodTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  periodTimeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  periodTime: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  periodBody: {},
  periodRowWrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  periodItemCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  periodItemCountText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  emptyPeriodWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyPeriodEmoji: {
    fontSize: 24,
  },
  emptyPeriodText: {
    fontSize: 14,
    textAlign: 'center',
  },
  menuRow: {
    gap: 0,
  },
  menuRowTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  menuEmojiSquare: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: {
    fontSize: 20,
  },
  menuRowContent: {
    flex: 1,
  },
  menuNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  menuName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  menuCalories: {
    fontSize: 13,
  },
  menuDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  tagsWrap: {
    marginTop: 8,
  },
  tagPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  menuWarningRow: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  menuWarningText: {
    fontSize: 11,
    color: '#E67E22',
    fontWeight: '600' as const,
  },
  menuWarningTextHighContrast: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  bottomPad: {
    height: 24,
  },
});
