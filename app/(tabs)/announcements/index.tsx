import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getColors } from '@/constants/colors';
import Card from '@/components/Card';
import { useSession } from '@/contexts/SessionContext';
import { sampleAnnouncements } from '@/mocks/data';

export default function AnnouncementsScreen() {
  const { resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.backgroundMain }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Stay updated with the latest news from dining services.</Text>
      {sampleAnnouncements.map((item) => (
        <Card key={item.id} style={[styles.card, { backgroundColor: colors.systemGray6 }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{item.formattedDate}</Text>
          </View>
          <Text style={[styles.body, { color: colors.textPrimary }]}>{item.content}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 22,
  },
  card: {
    padding: 16,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600' as const,
    flex: 1,
  },
  date: {
    fontSize: 13,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});
