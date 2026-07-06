import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native'
import { colors, fonts, shadow } from '../../constants/tokens'
import { Avatar } from '../../components/ui/Avatar'
import { useStore } from '../../store/useStore'
import { PEOPLE } from '../../store/data'

interface CalEvent {
  day: number
  label: string
  emoji: string
  personInitial: string
  color: string
  type: 'birthday' | 'reach-out' | 'reminder' | 'follow-up'
  followUpId?: string
}

const SEED_EVENTS: CalEvent[] = [
  { day: 3, label: "Mum's Birthday", emoji: '🎂', personInitial: 'M', color: colors.accent, type: 'birthday' },
  { day: 8, label: 'Josh – Follow up', emoji: '📞', personInitial: 'J', color: colors.fading, type: 'reach-out' },
  { day: 12, label: 'Sofia – Coffee', emoji: '☕', personInitial: 'S', color: colors.good, type: 'reach-out' },
  { day: 15, label: 'Priya – Design review', emoji: '💬', personInitial: 'P', color: colors.accent, type: 'reminder' },
  { day: 22, label: 'Rachel – Birthday', emoji: '🎂', personInitial: 'R', color: colors.accent2, type: 'birthday' },
]

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa']

function daysInMonth(m: number, y: number) { return new Date(y, m + 1, 0).getDate() }
function firstDayOfMonth(m: number, y: number) { return new Date(y, m, 1).getDay() }

export default function DatesScreen() {
  const insets = useSafeAreaInsets()
  const [month, setMonth] = useState(5)
  const [year, setYear] = useState(2026)
  const [selectedDay, setSelectedDay] = useState(23)
  const { followUps, completeFollowUp, dismissFollowUp } = useStore()

  const totalDays = daysInMonth(month, year)
  const firstDay = firstDayOfMonth(month, year)
  const today = new Date()

  // Convert store follow-ups to calendar events for this month
  const followUpEvents: CalEvent[] = followUps
    .filter((fu) => !fu.completed && fu.dueDate)
    .map((fu) => {
      const d = new Date(fu.dueDate!)
      if (d.getMonth() !== month || d.getFullYear() !== year) return null
      const person = fu.personId ? PEOPLE.find((p) => p.id === fu.personId) : null
      return {
        day: d.getDate(),
        label: `${fu.description}${person ? ` — ${person.first}` : ''}`,
        emoji: '📌',
        personInitial: person?.initial ?? '★',
        color: colors.accent2,
        type: 'follow-up' as const,
        followUpId: fu.id,
      }
    })
    .filter(Boolean) as CalEvent[]

  const allEvents = [...SEED_EVENTS, ...followUpEvents]

  const eventMap = allEvents.reduce<Record<number, CalEvent[]>>((acc, e) => {
    if (!acc[e.day]) acc[e.day] = []
    acc[e.day].push(e)
    return acc
  }, {})

  const selectedEvents = eventMap[selectedDay] ?? []

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1) }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // Upcoming follow-ups this month (not completed, sorted by date)
  const upcomingFollowUps = followUps
    .filter((fu) => !fu.completed && fu.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Dates</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.calHeader}>
          <Pressable onPress={prevMonth} style={styles.navBtn}><ChevronLeft size={20} color={colors.ink} /></Pressable>
          <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
          <Pressable onPress={nextMonth} style={styles.navBtn}><ChevronRight size={20} color={colors.ink} /></Pressable>
        </View>

        <View style={styles.weekRow}>
          {DAY_NAMES.map((d) => <Text key={d} style={styles.weekLabel}>{d}</Text>)}
        </View>

        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (!day) return <View key={`e${i}`} style={styles.cell} />
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSelected = day === selectedDay
            const dayEvents = eventMap[day] ?? []
            return (
              <Pressable key={day} onPress={() => setSelectedDay(day)} style={[styles.cell, isSelected && styles.cellSelected, isToday && !isSelected && styles.cellToday]}>
                <Text style={[styles.cellDay, isSelected && styles.cellDaySelected, isToday && !isSelected && styles.cellDayToday]}>{day}</Text>
                {dayEvents.length > 0 && (
                  <View style={styles.dotsRow}>
                    {dayEvents.slice(0, 3).map((ev, ei) => <View key={ei} style={[styles.dot, { backgroundColor: ev.color }]} />)}
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>

        <View style={styles.detailPanel}>
          <Text style={styles.detailTitle}>{MONTH_NAMES[month]} {selectedDay}</Text>
          {selectedEvents.length === 0 ? (
            <Text style={styles.noEvents}>Nothing scheduled — a good day to reach out!</Text>
          ) : (
            selectedEvents.map((ev, i) => (
              <View key={i} style={styles.eventCard}>
                <View style={[styles.eventDot, { backgroundColor: ev.color }]} />
                <Avatar initial={ev.personInitial} size={40} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventLabel}>{ev.label}</Text>
                  <View style={[styles.eventTypePill, { backgroundColor: ev.color + '22' }]}>
                    <Text style={[styles.eventType, { color: ev.color }]}>{ev.emoji} {ev.type.toUpperCase().replace('-', '‑')}</Text>
                  </View>
                </View>
                {ev.type === 'follow-up' && ev.followUpId && (
                  <Pressable
                    onPress={() => completeFollowUp(ev.followUpId!)}
                    style={styles.completeBtn}
                  >
                    <Check size={14} color={colors.good} />
                  </Pressable>
                )}
              </View>
            ))
          )}
        </View>

        {/* Follow-ups from voice captures */}
        {upcomingFollowUps.length > 0 && (
          <View style={styles.followUpsSection}>
            <Text style={styles.followUpsTitle}>Upcoming follow-ups</Text>
            {upcomingFollowUps.map((fu) => {
              const person = fu.personId ? PEOPLE.find((p) => p.id === fu.personId) : null
              const due = fu.dueDate ? new Date(fu.dueDate) : null
              return (
                <View key={fu.id} style={styles.fuCard}>
                  <View style={styles.fuLeft}>
                    <View style={styles.fuDot} />
                    <View>
                      <Text style={styles.fuDesc}>{fu.description}</Text>
                      <Text style={styles.fuMeta}>
                        {person ? `${person.first} · ` : ''}
                        {due ? due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.fuActions}>
                    <Pressable onPress={() => completeFollowUp(fu.id)} style={styles.fuCheckBtn}>
                      <Check size={14} color={colors.good} />
                    </Pressable>
                    <Pressable onPress={() => dismissFollowUp(fu.id)} style={styles.fuDismissBtn}>
                      <Text style={styles.fuDismissText}>Dismiss</Text>
                    </Pressable>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const CELL_SIZE = 44

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.small },
  monthTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  weekRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 4 },
  weekLabel: { flex: 1, textAlign: 'center', fontFamily: fonts.uiMedium, fontSize: 12, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  cell: { width: `${100 / 7}%`, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  cellSelected: { backgroundColor: colors.accent, borderRadius: 12 },
  cellToday: { backgroundColor: colors.accentSoft, borderRadius: 12 },
  cellDay: { fontFamily: fonts.uiMedium, fontSize: 14, color: colors.ink },
  cellDaySelected: { color: '#fff' },
  cellDayToday: { color: colors.accent },
  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  detailPanel: { marginTop: 16, marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: 20, padding: 20, ...shadow.card },
  detailTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, marginBottom: 16 },
  noEvents: { fontFamily: fonts.ui, fontSize: 14, color: colors.muted, fontStyle: 'italic' },
  eventCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  eventDot: { width: 6, height: 6, borderRadius: 3 },
  eventInfo: { flex: 1 },
  eventLabel: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink, marginBottom: 4 },
  eventTypePill: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  eventType: { fontFamily: fonts.uiSemiBold, fontSize: 10, letterSpacing: 0.8 },
  completeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e8f9f2', alignItems: 'center', justifyContent: 'center' },
  followUpsSection: { marginTop: 20, paddingHorizontal: 16 },
  followUpsTitle: { fontFamily: fonts.uiSemiBold, fontSize: 13, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  fuCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, ...shadow.small },
  fuLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  fuDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent2 },
  fuDesc: { fontFamily: fonts.uiMedium, fontSize: 14, color: colors.ink },
  fuMeta: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted, marginTop: 2 },
  fuActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fuCheckBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e8f9f2', alignItems: 'center', justifyContent: 'center' },
  fuDismissBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  fuDismissText: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted },
})
