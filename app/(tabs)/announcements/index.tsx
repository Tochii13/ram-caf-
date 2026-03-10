import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Clock, Megaphone } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';
import { sampleAnnouncements } from '@/mocks/data';

function AnnouncementCard({ item, index, colors }: {
  item: typeof sampleAnnouncements[0];
  index: number;
  colors: ReturnType<typeof getColors>;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    }}>
      <Pressable
        onPressIn={() => {
          Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
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
          <View style={[styles.cardAccent, { backgroundColor: colors.brandPrimary }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardTop}>
              <View style={[styles.iconCircle, { backgroundColor: colors.brandPrimaryLight }]}>
                <Megaphone size={16} color={colors.brandPrimary} />
              </View>
              <View style={styles.cardTitleWrap}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
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
  const { resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [headerFade]);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.backgroundMain }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.headerSection, { opacity: headerFade }]}>
        <View style={[styles.headerIconWrap, { backgroundColor: colors.brandPrimaryMedium }]}>
          <Megaphone size={28} color={colors.brandPrimary} />
        </View>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Latest Updates</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Stay informed about dining hours, new menu items, and campus events.
        </Text>
      </Animated.View>

      {sampleAnnouncements.length === 0 ? (
        <View style={styles.emptyState}>
          <Megaphone size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No announcements yet</Text>
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
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  cardList: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
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
    paddingLeft: 48,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500' as const,
  },
  bottomPad: {
    height: 24,
  },
});
