import React from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Heart, BellOff, Clock, MessageCircle, ChevronRight } from 'lucide-react-native'
import { colors, fonts, shadow } from '../../constants/tokens'
import { PEOPLE } from '../../store/data'
import { HealthRing } from '../../components/ui/HealthRing'
import { StatusDot } from '../../components/ui/StatusDot'
import { useStore } from '../../store/useStore'

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { favorites, toggleFavorite, muted, toggleMute } = useStore()

  const person = PEOPLE.find((p) => p.id === id)
  if (!person) return null

  const isFav = favorites.includes(person.id)
  const isMuted = muted.includes(person.id)

  const facts = [
    { label: 'Met', value: person.met },
    { label: 'Works as', value: person.work },
    { label: 'Usually orders', value: person.orders },
    { label: 'Birthday', value: person.birthday },
  ]

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={[colors.heroFrom, colors.heroTo]}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.headerTop}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
              <ArrowLeft size={20} color="#fff" />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable onPress={() => toggleFavorite(person.id)} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}>
                <Heart size={18} color="#fff" fill={isFav ? '#fff' : 'none'} />
              </Pressable>
              <Pressable onPress={() => toggleMute(person.id)} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}>
                <BellOff size={18} color={isMuted ? colors.fading : '#fff'} />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroContent}>
            <HealthRing initial={person.initial} pct={person.pct} size={80} status={person.status} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{person.name}</Text>
              <Text style={styles.heroRelation}>{person.relation}</Text>
              <View style={styles.statusRow}>
                <StatusDot status={person.status} />
                <Text style={styles.lastSeen}>Last contact {person.last}</Text>
              </View>
            </View>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{person.badge}</Text>
          </View>
        </LinearGradient>

        <View style={styles.pulledWrap}>
          <View style={styles.pulledCard}>
            <Text style={styles.pulledLabel}>💬 NAER REMEMBERS</Text>
            <Text style={styles.pulledText}>{person.pulled}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.push(`/compose/${person.id}`)}
            style={({ pressed }) => [styles.primaryAction, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
          >
            <MessageCircle size={18} color="#fff" />
            <Text style={styles.primaryActionText}>Send a note</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(`/person/${person.id}/timeline`)}
            style={({ pressed }) => [styles.secondaryAction, pressed && { opacity: 0.7 }]}
          >
            <Clock size={18} color={colors.accent2} />
            <Text style={styles.secondaryActionText}>Timeline</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={[styles.card, shadow.small]}>
            {facts.map((fact, i) => (
              <React.Fragment key={fact.label}>
                <View style={styles.factRow}>
                  <Text style={styles.factLabel}>{fact.label}</Text>
                  <Text style={styles.factValue}>{fact.value}</Text>
                </View>
                {i < facts.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relationship health</Text>
          <View style={[styles.card, shadow.small]}>
            <View style={styles.healthRow}>
              <View style={styles.healthInfo}>
                <Text style={styles.healthPct}>{person.pct}%</Text>
                <Text style={styles.healthLabel}>Connection score</Text>
              </View>
              <HealthRing initial={person.initial} pct={person.pct} size={56} status={person.status} />
            </View>
            <View style={styles.healthBar}>
              <View
                style={[
                  styles.healthFill,
                  {
                    width: `${person.pct}%`,
                    backgroundColor: person.status === 'good' ? colors.good : person.status === 'fading' ? colors.fading : colors.accent,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={() => router.push('/follow-up-schedules')}
            style={({ pressed }) => [styles.scheduleBtn, pressed && { opacity: 0.7 }]}
          >
            <Clock size={16} color={colors.accent2} />
            <Text style={styles.scheduleBtnText}>Set follow-up schedule</Text>
            <ChevronRight size={16} color={colors.accent2} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  heroInfo: { flex: 1 },
  heroName: { fontFamily: fonts.display, fontSize: 26, color: '#fff' },
  heroRelation: { fontFamily: fonts.ui, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  lastSeen: { fontFamily: fonts.ui, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.uiSemiBold, fontSize: 10, letterSpacing: 1, color: '#fff' },
  pulledWrap: { marginTop: -1, marginHorizontal: 16 },
  pulledCard: { backgroundColor: colors.accent2Soft, borderRadius: 16, padding: 16, marginBottom: 4 },
  pulledLabel: { fontFamily: fonts.uiSemiBold, fontSize: 10, letterSpacing: 1, color: colors.accent2, marginBottom: 6 },
  pulledText: { fontFamily: fonts.ui, fontSize: 14, color: colors.ink, fontStyle: 'italic' },
  actionsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 16, marginBottom: 4 },
  primaryAction: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 14, ...shadow.small },
  primaryActionText: { fontFamily: fonts.uiSemiBold, fontSize: 15, color: '#fff' },
  secondaryAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.accent2Soft, borderRadius: 16, paddingVertical: 14 },
  secondaryActionText: { fontFamily: fonts.uiMedium, fontSize: 14, color: colors.accent2 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontFamily: fonts.uiSemiBold, fontSize: 13, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16 },
  factRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  factLabel: { fontFamily: fonts.ui, fontSize: 14, color: colors.muted },
  factValue: { fontFamily: fonts.uiMedium, fontSize: 14, color: colors.ink, flex: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.line, marginHorizontal: 14 },
  healthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  healthInfo: {},
  healthPct: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
  healthLabel: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted },
  healthBar: { height: 6, backgroundColor: colors.ringTrack, borderRadius: 3, marginHorizontal: 14, marginBottom: 14 },
  healthFill: { height: 6, borderRadius: 3 },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.accent2Soft, borderRadius: 14, padding: 14 },
  scheduleBtnText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 14, color: colors.accent2 },
})
