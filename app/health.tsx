import React from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft } from 'lucide-react-native'
import { colors, fonts, shadow } from '../constants/tokens'
import { PEOPLE } from '../store/data'
import { HealthRing } from '../components/ui/HealthRing'
import { StatusDot } from '../components/ui/StatusDot'

function statusLabel(status: string) {
  if (status === 'good') return 'Thriving'
  if (status === 'fading') return 'Needs attention'
  return 'Needs you now'
}

function statusColor(status: string) {
  if (status === 'good') return colors.good
  if (status === 'fading') return colors.fading
  return colors.accent
}

export default function HealthScreen() {
  const insets = useSafeAreaInsets()
  const avgPct = Math.round(PEOPLE.reduce((sum, p) => sum + p.pct, 0) / PEOPLE.length)
  const goodCount = PEOPLE.filter((p) => p.status === 'good').length
  const fadingCount = PEOPLE.filter((p) => p.status === 'fading').length
  const needsCount = PEOPLE.filter((p) => p.status === 'needs').length

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><ArrowLeft size={20} color={colors.ink} /></Pressable>
        <Text style={styles.title}>Relationship health</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewPct}>{avgPct}%</Text>
          <Text style={styles.overviewLabel}>Average health</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}><View style={[styles.statDot, { backgroundColor: colors.good }]} /><Text style={styles.statCount}>{goodCount}</Text><Text style={styles.statLabel}>Thriving</Text></View>
            <View style={styles.statItem}><View style={[styles.statDot, { backgroundColor: colors.fading }]} /><Text style={styles.statCount}>{fadingCount}</Text><Text style={styles.statLabel}>Fading</Text></View>
            <View style={styles.statItem}><View style={[styles.statDot, { backgroundColor: colors.accent }]} /><Text style={styles.statCount}>{needsCount}</Text><Text style={styles.statLabel}>Needs you</Text></View>
          </View>
        </View>
        <Text style={styles.sectionTitle}>All relationships</Text>
        {[...PEOPLE].sort((a, b) => a.pct - b.pct).map((person) => (
          <Pressable key={person.id} onPress={() => router.push(`/person/${person.id}`)} style={({ pressed }) => [styles.personCard, pressed && { opacity: 0.7 }]}>
            <HealthRing initial={person.initial} pct={person.pct} size={52} status={person.status} />
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{person.name}</Text>
              <View style={styles.personStatus}><StatusDot status={person.status} /><Text style={[styles.personStatusText, { color: statusColor(person.status) }]}>{statusLabel(person.status)}</Text></View>
              <View style={styles.barTrack}><View style={[styles.barFill, { width: `${person.pct}%`, backgroundColor: statusColor(person.status) }]} /></View>
            </View>
            <Text style={styles.pctText}>{person.pct}%</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.small },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  overviewCard: { margin: 16, backgroundColor: colors.accent2, borderRadius: 20, padding: 24, alignItems: 'center', ...shadow.card },
  overviewPct: { fontFamily: fonts.display, fontSize: 56, color: '#fff' },
  overviewLabel: { fontFamily: fonts.ui, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 24 },
  statItem: { alignItems: 'center', gap: 4 },
  statDot: { width: 10, height: 10, borderRadius: 5 },
  statCount: { fontFamily: fonts.display, fontSize: 22, color: '#fff' },
  statLabel: { fontFamily: fonts.ui, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  sectionTitle: { fontFamily: fonts.uiSemiBold, fontSize: 13, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 10 },
  personCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, gap: 14, ...shadow.small },
  personInfo: { flex: 1 },
  personName: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink, marginBottom: 3 },
  personStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  personStatusText: { fontFamily: fonts.ui, fontSize: 12 },
  barTrack: { height: 4, backgroundColor: colors.ringTrack, borderRadius: 2 },
  barFill: { height: 4, borderRadius: 2 },
  pctText: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
})
