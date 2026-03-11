import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Clock, Megaphone, Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { getColors } from '@/constants/colors';
import { t } from '@/constants/i18n';
import { useSession } from '@/contexts/SessionContext';
import { sampleAnnouncements } from '@/mocks/data';

function AnnouncementCard({ item, index, colors }: {
  item: typeof sampleAnnouncements[0];
  index: number;
  colors: ReturnType<typeof getColors>;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: 200 + index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        delay: 200 + index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const isNew = index === 0;

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    }}>
      <Pressable
        onPressIn={() => {
          Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
          if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
        }}
      >
        <Animated.View style={[
          styles.card,
          {
            backgroundColor: colors.backgroundCard,
            shadowColor: colors.shadow,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
          <View style={[styles.cardAccent, { backgroundColor: isNew ? colors.brandPrimary : colors.accentGold }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardTop}>
              <View style={[styles.iconCircle, { backgroundColor: isNew ? colors.brandPrimaryLight : colors.accentGoldLight }]}>
                {isNew ? <Bell size={16} color={colors.brandPrimary} /> : <Megaphone size={16} color={colors.accentGold} />}
              </View>
              <View style={styles.cardTitleWrap}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>{item.title}</Text>
                  {isNew ? (
                    <View style={[styles.newBadge, { backgroundColor: colors.brandPrimary }]}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.dateRow}>
                  <Clock size={12} color={colors.textSecondary} />
                  <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{item.formattedDate}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.cardBody, { color: colors.textSecondary }]}>{item.content}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function AnnouncementsScreen() {
  const { resolvedColorScheme, highContrastEnabled, appLanguage } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerFade, headerSlide, iconScale]);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.backgroundMain }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.headerSection, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <Animated.View style={[styles.headerIconWrap, { backgroundColor: colors.brandPrimaryMedium, transform: [{ scale: iconScale }] }]}>
          <Megaphone size={28} color={colors.brandPrimary} />
        </Animated.View>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t(appLanguage, 'latestUpdates')}</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {t(appLanguage, 'stayInformed')}
        </Text>
        <View style={[styles.countBadge, { backgroundColor: colors.brandPrimaryLight }]}>
          <Text style={[styles.countBadgeText, { color: colors.brandPrimary }]}>{sampleAnnouncements.length} {sampleAnnouncements.length !== 1 ? t(appLanguage, 'updates') : t(appLanguage, 'update')}</Text>
        </View>
      </Animated.View>

      {sampleAnnouncements.length === 0 ? (
        <View style={styles.emptyState}>
          <Megaphone size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t(appLanguage, 'noAnnouncementsYet')}</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{t(appLanguage, 'checkBackLater')}</Text>
        </View>
      ) : (
        <View style={styles.cardList}>
          {sampleAnnouncements.map((item, index) => (
            <AnnouncementCard key={item.id} item={item} index={index} colors={colors} />
          ))}
        </View>
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 8,
  },
  headerIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  countBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 12,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  cardList: {
    gap: 14,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden' as const,
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
  cardAccent: {
    height: 3,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardDate: {
    fontSize: 13,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 50,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  emptySubtext: {
    fontSize: 14,
  },
  bottomPad: {
    height: 24,
  },
});
