import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import StatusChip from '@/components/StatusChip';
import { adminDashboardData } from '@/mocks/data';

const data = adminDashboardData;

export default function AdminDashboardScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.kpiGrid}>
        {data.kpis.map((kpi) => (
          <Card key={kpi.id} style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>{kpi.title}</Text>
            <Text style={styles.kpiPrimary}>{kpi.primaryValue}</Text>
            {kpi.secondaryValue ? <Text style={styles.kpiSecondary}>{kpi.secondaryValue}</Text> : null}
            {kpi.tertiaryValue ? <Text style={styles.kpiTertiary}>{kpi.tertiaryValue}</Text> : null}
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>
        <Text style={styles.sectionSubtitle}>{data.todayLabel}</Text>
        <Card style={styles.sectionCard}>
          {data.todayMeals.map((meal, index) => (
            <View key={meal.id} style={[styles.mealRow, index < data.todayMeals.length - 1 && styles.rowBorder]}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealName}>{meal.mealName}</Text>
                <StatusChip status={meal.status} />
              </View>
              <Text style={styles.mealMenu}>{meal.menuTitle}</Text>
              <Text style={styles.mealMeta}>{meal.timeRange} · {meal.servingsPlanned} servings</Text>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming Plans</Text>
          <Text style={styles.viewCalendar}>View Calendar</Text>
        </View>
        <Card style={styles.sectionCard}>
          {data.upcomingPlans.map((plan, index) => (
            <View key={plan.id} style={[styles.planRow, index < data.upcomingPlans.length - 1 && styles.rowBorder]}>
              <View style={styles.planDate}>
                <Text style={styles.planDateLabel}>{plan.dateLabel}</Text>
                <Text style={styles.planDayLabel}>{plan.dayLabel}</Text>
              </View>
              <StatusChip status={plan.status} />
              <Text style={styles.planTitle} numberOfLines={1}>{plan.title ?? '—'}</Text>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Favorites — This Week</Text>
        <Card style={styles.sectionCard}>
          {data.favorites.map((fav, index) => (
            <View key={fav.id} style={[styles.favRow, index < data.favorites.length - 1 && styles.rowBorder]}>
              <Text style={styles.favRank}>{fav.rank}</Text>
              <View style={styles.favInfo}>
                <Text style={styles.favName}>{fav.name}</Text>
                <Text style={styles.favCategory}>{fav.category}</Text>
              </View>
              <View style={styles.favStats}>
                <Text style={styles.favCount}>{fav.count} orders</Text>
                <View style={[styles.deltaBadge, { backgroundColor: fav.deltaPercentage >= 0 ? 'rgba(111,191,115,0.15)' : 'rgba(211,47,47,0.15)' }]}>
                  <Text style={[styles.deltaText, { color: fav.deltaPercentage >= 0 ? Colors.accentGreen : Colors.destructive }]}>
                    {fav.deltaPercentage >= 0 ? '↑' : '↓'} {Math.abs(fav.deltaPercentage)}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.backgroundMain },
  content: { padding: 16, paddingTop: 8, paddingBottom: 16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  kpiCard: { flexBasis: '47%', flexGrow: 1, padding: 16 },
  kpiTitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  kpiPrimary: { fontSize: 28, fontWeight: '700' as const, color: Colors.textPrimary, letterSpacing: -0.5 },
  kpiSecondary: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  kpiTertiary: { fontSize: 14, color: Colors.accentGreen, fontWeight: '500' as const, marginTop: 2 },
  section: { marginBottom: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.textPrimary, marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 10 },
  viewCalendar: { fontSize: 14, color: Colors.brandPrimary, fontWeight: '500' as const },
  sectionCard: { padding: 4 },
  mealRow: { padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  mealName: { fontSize: 17, fontWeight: '600' as const, color: Colors.textPrimary },
  mealMenu: { fontSize: 15, color: Colors.textPrimary, marginBottom: 4 },
  mealMeta: { fontSize: 13, color: Colors.textSecondary },
  planRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  planDate: { minWidth: 60 },
  planDateLabel: { fontSize: 13, fontWeight: '600' as const, color: Colors.textPrimary },
  planDayLabel: { fontSize: 12, color: Colors.textSecondary },
  planTitle: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  favRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  favRank: { fontSize: 18, fontWeight: '700' as const, color: Colors.brandPrimary, minWidth: 24, textAlign: 'center' as const },
  favInfo: { flex: 1 },
  favName: { fontSize: 16, fontWeight: '600' as const, color: Colors.textPrimary },
  favCategory: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  favStats: { alignItems: 'flex-end' as const },
  favCount: { fontSize: 14, color: Colors.textPrimary },
  deltaBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  deltaText: { fontSize: 12, fontWeight: '700' as const },
  bottomPad: { height: 24 },
});
