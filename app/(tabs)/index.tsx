import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bell } from 'lucide-react-native'
import { colors, fonts, shadow } from '../../constants/tokens'
import { PEOPLE } from '../../store/data'
import { Avatar } from '../../components/ui/Avatar'
import { HealthRing } from '../../components/ui/HealthRing'
import { StatusDot } from '../../components/ui/StatusDot'

const today = new Date()
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
const dateString = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`

const needsPeople = PEOPLE.filter((p) => p.status === 'needs')
const fadingPeople = PEOPLE.filter((p) => p.status === 'fading')
const todayFocus = needsPeople[0] || fadingPeople[0] || PEOPLE[0]
const morePeople = [...needsPeople, ...fadingPeople].filter((p) => p.id !== todayFocus.id).slice(0, 2)

const upcomingDates = [
  { label: "Mum's Birthday", date: 'Jun 3', emoji: '🎂', daysAway: 3 },
  { label: "Josh – Follow up", date: 'Jun 8', emoji: '📞', daysAway: 8 },
  { label: "Sofia – Playdate", date: 'Jun 12', emoji: '☕', daysAway: 12 },
]

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const reached = 12
  const streak = 7

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.heroFrom, colors.heroTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Good morning, Maya</Text>
              <Text style={styles.dateText}>{dateString}</Text>
              <Text style={styles.subheading}>3 people could use a hello today</Text>
            </View>
            <View style={styles.headerRight}>
              <Pressable
                onPress={() => router.push('/tell-naer')}
                style={({ pressed }) => [styles.bellBtn, pressed && { opacity: 0.7 }]}
              >
                <Bell size={20} color="#fff" />
                <View style={styles.bellBadge} />
              </Pressable>
              <Avatar initial="M" size={40} bg="rgba(255,255,255,0.2)" />
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.focusCardWrap, { marginTop: -58 }]}>
          <View style={styles.focusCard}>
            <Text style={styles.accentLabel}>TODAY · ONE THING</Text>
            <View style={styles.focusRow}>
              <HealthRing
                initial={todayFocus.initial}
                pct={todayFocus.pct}
                size={56}
                status={todayFocus.status}
              />
              <View style={styles.focusInfo}>
                <Text style={styles.focusName}>{todayFocus.name}</Text>
                <Text style={styles.focusRelation}>{todayFocus.relation}</Text>
                <Text style={styles.focusLast}>Last contact: {todayFocus.last}</Text>
              </View>
            </View>
            <Text style={styles.focusPulled}>💬 {todayFocus.pulled}</Text>
            <Pressable
              onPress={() => router.push(`/compose/${todayFocus.id}`)}
              style={({ pressed }) => [
                styles.sendBtn,
                pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.sendBtnText}>Send a note</Text>
            </Pressable>
          </View>
        </View>

        {morePeople.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {morePeople.length} more {morePeople.length === 1 ? 'person' : 'people'} who'd love to hear from you
            </Text>
            {morePeople.map((person) => (
              <Pressable
                key={person.id}
                onPress={() => router.push(`/person/${person.id}`)}
                style={({ pressed }) => [
                  styles.personRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Avatar initial={person.initial} size={40} />
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personSub}>{person.relation} · {person.last}</Text>
                </View>
                <StatusDot status={person.status} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your circle</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.circleScroll}>
            {PEOPLE.map((person) => (
              <Pressable
                key={person.id}
                onPress={() => router.push(`/person/${person.id}`)}
                style={styles.circleItem}
              >
                <HealthRing
                  initial={person.initial}
                  pct={person.pct}
                  size={60}
                  status={person.status}
                />
                <Text style={styles.circleName}>{person.first}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, shadow.card]}>
            <Text style={styles.statNum}>{reached}</Text>
            <Text style={styles.statLabel}>people reached{"\n"}this month</Text>
          </View>
          <Pressable
            onPress={() => router.push('/health')}
            style={[styles.statCard, shadow.card]}
          >
            <Text style={styles.statNum}>{streak}</Text>
            <Text style={styles.statLabel}>day streak 🔥</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming up</Text>
          {upcomingDates.map((item, i) => (
            <View key={i} style={styles.upcomingRow}>
              <Text style={styles.upcomingEmoji}>{item.emoji}</Text>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingLabel}>{item.label}</Text>
                <Text style={styles.upcomingDate}>{item.date}</Text>
              </View>
              <View style={styles.daysChip}>
                <Text style={styles.daysText}>in {item.daysAway}d</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flex: 1 },
  headerRight: {
    alignItems: 'center',
    gap: 10,
  },
  greeting: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: '#fff',
    marginBottom: 2,
  },
  dateText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  subheading: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.heroTo,
  },
  focusCardWrap: {
    marginHorizontal: 16,
  },
  focusCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    ...shadow.card,
  },
  accentLabel: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.accent,
    marginBottom: 14,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  focusInfo: { flex: 1 },
  focusName: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 2,
  },
  focusRelation: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.muted,
  },
  focusLast: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.muted,
  },
  focusPulled: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sendBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendBtnText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
    color: '#fff',
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 12,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    ...shadow.small,
  },
  personInfo: { flex: 1, marginLeft: 12 },
  personName: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.ink,
  },
  personSub: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  circleScroll: { marginLeft: -20 },
  circleItem: {
    alignItems: 'center',
    marginLeft: 20,
    gap: 6,
  },
  circleName: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.ink,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 28,
    paddingHorizontal: 20,
    gap: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    ...shadow.small,
  },
  upcomingEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  upcomingInfo: { flex: 1 },
  upcomingLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: colors.ink,
  },
  upcomingDate: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  daysChip: {
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  daysText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.accent,
  },
})
