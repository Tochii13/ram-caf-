import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Search, Star, X } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import Card from '@/components/Card';
import FlowTagList from '@/components/FlowTagList';
import MenuItemCard from '@/components/MenuItemCard';
import MenuItemDetailView from '@/components/MenuItemDetailView';
import { useMenuStore } from '@/contexts/MenuStoreContext';
import { useRatingsStore } from '@/contexts/RatingsStoreContext';
import { useSession } from '@/contexts/SessionContext';
import { sampleAnnouncements, sampleCafeHours } from '@/mocks/data';
import { DIETARY_TAG_EMOJIS, DIETARY_TAG_LABELS, MealPeriod, MEAL_PERIOD_LABELS, MEAL_PERIOD_TIMES, MenuItem } from '@/types';

type FilterOption = 'all' | MealPeriod;

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
];

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good Morning, ${name}! 👋`;
  if (hour >= 12 && hour < 17) return `Good Afternoon, ${name}! 👋`;
  return `Good Evening, ${name}! 👋`;
}

function getDayName(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
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

function getMinutesUntil(targetHour: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetHour, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 60000));
}

function getCountdownState(): { message: string; highlight?: string; accessibilityMessage: string } {
  const hour = new Date().getHours();
  const periods: MealPeriod[] = ['breakfast', 'lunch', 'dinner'];

  for (const period of periods) {
    const range = MEAL_PERIOD_TIMES[period];
    if (hour >= range.startHour && hour < range.endHour) {
      const mins = getMinutesUntil(range.endHour);
      return {
        message: `🕐 ${MEAL_PERIOD_LABELS[period]} closes in `,
        highlight: formatCountdown(mins),
        accessibilityMessage: `${MEAL_PERIOD_LABELS[period]} closes in ${formatCountdownLong(mins)}.`,
      };
    }
    if (hour < range.startHour) {
      const mins = getMinutesUntil(range.startHour);
      return {
        message: `🕐 ${MEAL_PERIOD_LABELS[period]} opens in `,
        highlight: formatCountdown(mins),
        accessibilityMessage: `${MEAL_PERIOD_LABELS[period]} opens in ${formatCountdownLong(mins)}.`,
      };
    }
  }

  return {
    message: 'See you tomorrow! Breakfast opens at 7:00 AM',
    accessibilityMessage: 'All meals are closed for today. Breakfast opens at 7:00 AM tomorrow.',
  };
}

function getUnratedPeriod(ratedPeriods: Set<string>): MealPeriod | null {
  const dateKey = getDateKey(new Date());
  const hour = new Date().getHours();
  const candidates: MealPeriod[] = ['dinner', 'lunch', 'breakfast'];
  return candidates.find((period) => hour >= MEAL_PERIOD_TIMES[period].endHour && !ratedPeriods.has(`${dateKey}-${period}`)) ?? null;
}

function RecommendationCard({ item, colors, highContrast }: { item: MenuItem; colors: ReturnType<typeof getColors>; highContrast: boolean }) {
  return (
    <Card style={styles.recommendationCard}>
      <View style={styles.recommendationAccent} accessible={false} />
      <View style={[styles.recommendationEmojiWrap, { backgroundColor: colors.surfaceTimeBlock }]} accessible={false}>
        <Text style={styles.recommendationEmoji}>{item.emoji}</Text>
      </View>
      <Text style={[styles.recommendationName, { color: colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
      <Text style={[styles.recommendationCalories, { color: colors.textSecondary }]}>{item.calories} cal</Text>
      <FlowTagList style={styles.recommendationTagsWrap}>
        {item.dietaryTags.slice(0, 2).map((tag) => (
          <View key={tag} style={[styles.recommendationTagPill, highContrast ? { backgroundColor: colors.brandPrimary } : {}]}>
            <Text style={[styles.recommendationTagText, { color: highContrast ? '#FFFFFF' : colors.brandPrimary }]}>
              {DIETARY_TAG_EMOJIS[tag]} {DIETARY_TAG_LABELS[tag]}
            </Text>
          </View>
        ))}
      </FlowTagList>
    </Card>
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onSkip}>
      <View style={styles.sheetOverlay}>
        <View style={[styles.sheetCard, { backgroundColor: colors.backgroundCard }]}>
          <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>How was {mealPeriod ? MEAL_PERIOD_LABELS[mealPeriod] : 'your meal'}?</Text>
          <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>Rate the items you tried today.</Text>
          {items.length === 0 ? (
            <Text style={[styles.sheetEmpty, { color: colors.textSecondary }]}>Nothing to rate for this period.</Text>
          ) : (
            <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetListContent}>
              {items.map((item) => (
                <View key={item.id} style={[styles.ratingRow, { borderBottomColor: colors.borderSubtle }]}>
                  <Text style={[styles.ratingItemName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const selected = (selectedRatings[item.id] ?? 0) >= star;
                      return (
                        <Pressable
                          key={star}
                          onPress={() => setSelectedRatings((prev) => ({ ...prev, [item.id]: star }))}
                          hitSlop={6}
                          testID={`rate-${item.id}-${star}`}
                          accessibilityLabel={`${star} star${star > 1 ? 's' : ''} for ${item.name}`}
                          accessibilityRole="button"
                        >
                          <Star size={22} color={selected ? colors.brandPrimary : colors.textSecondary} fill={selected ? colors.brandPrimary : 'transparent'} />
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

export default function TodayScreen() {
  const router = useRouter();
  const { currentUser, effectiveDietaryTags, resolvedColorScheme, highContrastEnabled } = useSession();
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

  const isSearching = searchQuery.trim().length > 0;

  const visiblePeriods = useMemo<MealPeriod[]>(() => (filter === 'all' ? ['breakfast', 'lunch', 'dinner'] : [filter]), [filter]);

  const menuByPeriod = useMemo(() => {
    const map: Record<MealPeriod, MenuItem[]> = { breakfast: [], lunch: [], dinner: [] };
    menuItems.forEach((item) => map[item.mealPeriod].push(item));
    return map;
  }, [menuItems]);

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchQuery.trim().toLowerCase();
    return menuItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [isSearching, menuItems, searchQuery]);

  const pickedForYou = useMemo(() => {
    if (effectiveDietaryTags.length === 0) return [];
    return menuItems.filter((item) => item.dietaryTags.some((tag) => effectiveDietaryTags.includes(tag))).slice(0, 3);
  }, [effectiveDietaryTags, menuItems]);

  const isAnyPeriodOpen = sampleCafeHours.some((item) => item.isOpenNow);
  const unratedPeriod = useMemo(() => getUnratedPeriod(ratedPeriods), [ratedPeriods]);

  const ratingItems = useMemo(() => {
    if (!unratedPeriod) return [];
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

  return (
    <>
      <ScrollView style={[styles.scroll, { backgroundColor: colors.backgroundMain }]} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <Text style={[styles.greeting, { color: colors.textPrimary }]}>{getGreeting(firstName)}</Text>
          <Text style={[styles.dateSubline, { color: colors.textSecondary }]}>Here&apos;s today&apos;s menu for {getDayName()}</Text>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.backgroundCard, borderColor: colors.borderSubtle }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search menu items..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search menu items"
            testID="menu-search-input"
          />
          {isSearching ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8} accessibilityLabel="Clear search" accessibilityRole="button">
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {isSearching ? (
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
        ) : (
          <>
            {firstAnnouncement ? (
              <Pressable
                onPress={() => router.push('/announcements')}
                testID="announcement-banner"
                accessibilityLabel={`Announcement: ${firstAnnouncement.title}.`}
                accessibilityHint="Tap to view all announcements."
                accessibilityRole="button"
              >
                <Card style={[styles.announcementCard, { backgroundColor: colors.accentPink }]}>
                  <View style={styles.announcementInner}>
                    <View style={styles.announcementContent}>
                      <Text style={[styles.announcementTitle, { color: colors.brandPrimary }]}>{firstAnnouncement.title}</Text>
                      <Text style={[styles.announcementExcerpt, { color: colors.textSecondary }]} numberOfLines={1}>{firstAnnouncement.content}</Text>
                    </View>
                    <ChevronRight size={20} color={colors.brandPrimary} />
                  </View>
                </Card>
              </Pressable>
            ) : null}

            <Card style={styles.hoursCard}>
              <View style={styles.hoursHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today&apos;s Hours</Text>
                {isAnyPeriodOpen ? (
                  <View style={[styles.openBadge, { backgroundColor: colors.accentGreen }]}>
                    <Text style={styles.openBadgeText} accessibilityLabel="Open Now">Open Now</Text>
                  </View>
                ) : null}
              </View>
              {sampleCafeHours.map((period) => (
                <View
                  key={period.mealPeriod}
                  style={styles.hourRow}
                  accessibilityLabel={`${MEAL_PERIOD_LABELS[period.mealPeriod]}. ${period.startTime} to ${period.endTime}. ${period.isOpenNow ? 'Open now.' : 'Closed.'}`}
                >
                  <View style={[styles.periodPill, { backgroundColor: colors.surfaceTimeBlock }]}>
                    <Text style={[styles.periodPillText, { color: colors.textPrimary }]}>{MEAL_PERIOD_LABELS[period.mealPeriod]}</Text>
                  </View>
                  <Text style={[styles.timeRange, { color: colors.textSecondary }]}>{period.startTime} – {period.endTime}</Text>
                  {period.isOpenNow ? <View style={[styles.openDot, { backgroundColor: colors.accentGreen }]} accessible={false} /> : null}
                </View>
              ))}
            </Card>

            <Card
              style={styles.countdownCard}
            >
              <Text
                style={[styles.countdownText, { color: colors.textPrimary }]}
                accessibilityLabel={countdownMessage.accessibilityMessage}
                accessibilityRole="text"
              >
                {countdownMessage.message}
                {countdownMessage.highlight ? <Text style={[styles.countdownHighlight, { color: colors.brandPrimary }]}>{countdownMessage.highlight}</Text> : null}
              </Text>
            </Card>

            {unratedPeriod ? (
              <Pressable
                onPress={() => setShowRatingSheet(true)}
                testID="rating-banner"
                accessibilityLabel={`Rate ${MEAL_PERIOD_LABELS[unratedPeriod]}. Tap to leave a rating.`}
                accessibilityHint={`Opens the rating screen for today's ${MEAL_PERIOD_LABELS[unratedPeriod].toLowerCase()} items.`}
                accessibilityRole="button"
              >
                <Card style={[styles.ratingBanner, { backgroundColor: colors.accentPink }]}>
                  <View style={[styles.ratingBannerAccent, { backgroundColor: colors.brandPrimary }]} accessible={false} />
                  <View style={styles.ratingBannerInner}>
                    <Star size={20} color={colors.brandPrimary} fill={colors.brandPrimary} />
                    <Text style={[styles.ratingBannerText, { color: colors.textPrimary }]}>
                      How was {MEAL_PERIOD_LABELS[unratedPeriod]}? Tap to leave a rating.
                    </Text>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </View>
                </Card>
              </Pressable>
            ) : null}

            {pickedForYou.length > 0 ? (
              <View style={styles.pickedSection}>
                <Text style={[styles.pickedTitle, { color: colors.textPrimary }]}>🌟 Picked for You</Text>
                <Text style={[styles.pickedSubtitle, { color: colors.textSecondary }]}>Based on your preferences</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationRow}>
                  {pickedForYou.map((item) => (
                    <RecommendationCard key={item.id} item={item} colors={colors} highContrast={highContrastEnabled} />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <Text style={[styles.menuSectionTitle, { color: colors.textPrimary }]}>Today&apos;s Menu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
              {FILTERS.map((f) => {
                const selected = filter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[styles.chip, { backgroundColor: selected ? colors.brandPrimary : colors.chipUnselected }]}
                    testID={`filter-${f.key}`}
                    accessibilityLabel={`${f.label} filter`}
                    accessibilityHint={selected ? 'Currently selected.' : `Tap to show ${f.label} items only.`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.textSecondary }]}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {visiblePeriods.map((period) => {
              const items = menuByPeriod[period];
              if (items.length === 0) return null;
              return (
                <View key={period} style={styles.periodSection}>
                  <View style={styles.periodHeader}>
                    <Text style={[styles.periodName, { color: colors.textPrimary }]}>{MEAL_PERIOD_LABELS[period]}</Text>
                    <Text style={[styles.periodTime, { color: colors.textSecondary }]}>{MEAL_PERIOD_TIMES[period].timeRange}</Text>
                  </View>
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} onPress={() => setSelectedItem(item)} />
                  ))}
                </View>
              );
            })}
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      <RatingSheetView visible={showRatingSheet} mealPeriod={unratedPeriod} items={ratingItems} onSubmit={handleSubmitRatings} onSkip={handleSkipRatings} />

      <Modal visible={selectedItem !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedItem(null)}>
        <View style={[styles.detailModalShell, { backgroundColor: colors.backgroundMain }]}>
          <View style={[styles.detailModalHeader, { borderBottomColor: colors.borderSubtle }]}>
            <Pressable onPress={() => setSelectedItem(null)} accessibilityLabel="Close details" accessibilityRole="button">
              <Text style={[styles.detailCloseText, { color: colors.brandPrimary }]}>Close</Text>
            </Pressable>
            <Text style={[styles.detailModalTitle, { color: colors.textPrimary }]}>Item Details</Text>
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
    padding: 16,
    paddingBottom: 16,
  },
  greetingSection: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
  },
  dateSubline: {
    fontSize: 15,
    marginTop: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 14,
    gap: 8,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
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
    padding: 14,
    marginBottom: 14,
    borderColor: 'transparent',
  },
  announcementInner: {
    flexDirection: 'row',
    alignItems: 'center',
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
    padding: 16,
    marginBottom: 14,
  },
  hoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  openBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  periodPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 88,
    alignItems: 'center',
  },
  periodPillText: {
    fontSize: 14,
    fontWeight: '500' as const,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  countdownText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500' as const,
  },
  countdownHighlight: {
    fontWeight: '700' as const,
  },
  ratingBanner: {
    marginBottom: 14,
    overflow: 'hidden' as const,
    borderColor: 'transparent',
  },
  ratingBannerAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  ratingBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 14,
    gap: 10,
  },
  ratingBannerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  pickedSection: {
    marginBottom: 18,
  },
  pickedTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
  },
  pickedSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  recommendationRow: {
    gap: 12,
    paddingRight: 16,
  },
  recommendationCard: {
    width: 160,
    minHeight: 180,
    padding: 14,
    alignItems: 'center',
    overflow: 'hidden' as const,
  },
  recommendationAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#9B4040',
  },
  recommendationEmojiWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  recommendationEmoji: {
    fontSize: 22,
  },
  recommendationName: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600' as const,
    minHeight: 42,
  },
  recommendationCalories: {
    marginTop: 6,
    fontSize: 13,
  },
  recommendationTagsWrap: {
    justifyContent: 'center',
    marginTop: 12,
  },
  recommendationTagPill: {
    backgroundColor: 'rgba(155,64,64,0.15)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recommendationTagText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  periodSection: {
    marginBottom: 16,
  },
  periodHeader: {
    marginBottom: 10,
  },
  periodName: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  periodTime: {
    fontSize: 13,
    marginTop: 2,
  },
  bottomPad: {
    height: 24,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 320,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  sheetList: {
    maxHeight: 300,
  },
  sheetListContent: {
    gap: 12,
  },
  ratingRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  ratingItemName: {
    fontSize: 15,
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sheetPrimaryButton: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetPrimaryButtonPressed: {
    opacity: 0.86,
  },
  sheetPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  sheetSecondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    marginTop: 10,
  },
  sheetSecondaryText: {
    fontSize: 13,
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
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailCloseText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  detailModalTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  detailHeaderSpacer: {
    width: 50,
  },
});
