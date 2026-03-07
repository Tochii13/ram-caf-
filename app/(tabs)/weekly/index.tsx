import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import Card from '@/components/Card';
import FlowTagList from '@/components/FlowTagList';
import { useMenuStore } from '@/contexts/MenuStoreContext';
import { useSession } from '@/contexts/SessionContext';
import { DIETARY_TAG_EMOJIS, DIETARY_TAG_LABELS, MealPeriod, MEAL_PERIOD_LABELS, MEAL_PERIOD_TIMES, WeeklyMenuItem } from '@/types';

function WeeklyMenuItemRow({ item, colors, highContrast }: { item: WeeklyMenuItem; colors: ReturnType<typeof getColors>; highContrast: boolean }) {
  return (
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
            <Text style={[styles.menuName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.menuCalories, { color: colors.textSecondary }]}>{item.calories} cal</Text>
          </View>
          {item.description ? (
            <Text style={[styles.menuDescription, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
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
                      : { backgroundColor: 'rgba(155,64,64,0.15)' },
                  ]}
                >
                  <Text style={[styles.tagPillText, { color: highContrast ? '#FFFFFF' : colors.brandPrimary }]}>
                    {DIETARY_TAG_EMOJIS[tag]} {DIETARY_TAG_LABELS[tag]}
                  </Text>
                </View>
              ))}
            </FlowTagList>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function WeeklyScreen() {
  const { weeklyDays } = useMenuStore();
  const { resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const foundIndex = weeklyDays.findIndex((item) => item.weekday === weekday);
    setSelectedIndex(foundIndex >= 0 ? foundIndex : 0);
  }, [weeklyDays]);

  const selectedDay = weeklyDays[selectedIndex] ?? weeklyDays[0];

  useEffect(() => {
    translateX.setValue(18);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [opacity, selectedIndex, translateX]);

  const itemsByPeriod = useMemo(() => {
    const map: Record<MealPeriod, WeeklyMenuItem[]> = { breakfast: [], lunch: [], dinner: [] };
    selectedDay?.items.forEach((item) => {
      map[item.mealPeriod].push(item);
    });
    return map;
  }, [selectedDay]);

  const goToPrev = () => {
    if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  const goToNext = () => {
    if (selectedIndex < weeklyDays.length - 1) setSelectedIndex(selectedIndex + 1);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.backgroundMain }]}>
      <View style={styles.dayPickerContainer}>
        <Pressable
          onPress={goToPrev}
          style={[styles.arrowButton, { opacity: selectedIndex === 0 ? 0.3 : 1 }]}
          disabled={selectedIndex === 0}
          accessibilityLabel="Previous day"
          accessibilityRole="button"
          hitSlop={8}
        >
          <ChevronLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayPickerRow}
          style={styles.dayPickerScroll}
        >
          {weeklyDays.map((day, index) => {
            const selected = index === selectedIndex;
            return (
              <Pressable
                key={day.id}
                onPress={() => setSelectedIndex(index)}
                style={[styles.dayChip, selected && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary }, !selected && { backgroundColor: colors.backgroundCard, borderColor: colors.borderSubtle }]}
                testID={`weekly-day-${day.weekday.toLowerCase()}`}
                accessibilityLabel={`${day.weekday}, ${day.dateLabel}`}
                accessibilityHint={selected ? 'Currently selected.' : `Tap to view ${day.weekday} menu.`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.dayChipWeekday, { color: selected ? '#FFFFFF' : colors.textPrimary }]}>{day.weekday.slice(0, 3)}</Text>
                <Text style={[styles.dayChipDate, { color: selected ? '#FFFFFF' : colors.textPrimary }]}>{day.dateLabel.split(' ')[1]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          onPress={goToNext}
          style={[styles.arrowButton, { opacity: selectedIndex === weeklyDays.length - 1 ? 0.3 : 1 }]}
          disabled={selectedIndex === weeklyDays.length - 1}
          accessibilityLabel="Next day"
          accessibilityRole="button"
          hitSlop={8}
        >
          <ChevronRight size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity, transform: [{ translateX }] }}>
          {(['breakfast', 'lunch', 'dinner'] as MealPeriod[]).map((period) => (
            <Card key={period} style={styles.periodCard}>
              <View style={[styles.periodTop, { backgroundColor: colors.surfaceTimeBlock }]}>
                <Text style={[styles.periodTitle, { color: colors.textPrimary }]}>{MEAL_PERIOD_LABELS[period]}</Text>
                <Text style={[styles.periodTime, { color: colors.textSecondary }]}>{MEAL_PERIOD_TIMES[period].timeRange}</Text>
              </View>
              <View style={[styles.periodBody, { backgroundColor: colors.backgroundCard }]}>
                {itemsByPeriod[period].map((item, index) => (
                  <View key={item.id} style={[styles.periodRowWrap, index < itemsByPeriod[period].length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }]}>
                    <WeeklyMenuItemRow item={item} colors={colors} highContrast={highContrastEnabled} />
                  </View>
                ))}
                {itemsByPeriod[period].length === 0 ? (
                  <View style={styles.periodRowWrap}>
                    <Text style={[styles.emptyPeriodText, { color: colors.textSecondary }]}>No items for this period.</Text>
                  </View>
                ) : null}
              </View>
            </Card>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  dayPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  arrowButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPickerScroll: {
    flex: 1,
    flexGrow: 0,
  },
  dayPickerRow: {
    paddingTop: 6,
    paddingBottom: 2,
    gap: 10,
  },
  dayChip: {
    width: 64,
    minHeight: 70,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipWeekday: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  dayChipDate: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  periodCard: {
    marginBottom: 14,
    overflow: 'hidden' as const,
  },
  periodTop: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  periodTime: {
    fontSize: 13,
  },
  periodBody: {},
  periodRowWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    gap: 10,
    alignItems: 'flex-start',
  },
  menuEmojiSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: {
    fontSize: 18,
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
    fontSize: 15,
    fontWeight: '500' as const,
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
    paddingVertical: 3,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
});
