import React from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Mic } from 'lucide-react-native'
import { colors, fonts, shadow } from '../../../constants/tokens'
import { PEOPLE } from '../../../store/data'
import { Avatar } from '../../../components/ui/Avatar'
import { useStore } from '../../../store/useStore'

interface TimelineEntry {
  id: string
  type: 'message' | 'call' | 'in-person' | 'note'
  description: string
  date: string
  emoji: string
}

function mockTimeline(): TimelineEntry[] {
  return [
    { id: '1', type: 'message', description: 'Sent a check-in message', date: 'Jun 1, 2026', emoji: '💬' },
    { id: '2', type: 'note', description: 'Mentioned new project at Google', date: 'May 10, 2026', emoji: '📝' },
    { id: '3', type: 'call', description: 'Quick catch-up call, 20 mins', date: 'Apr 28, 2026', emoji: '📞' },
    { id: '4', type: 'in-person', description: 'Coffee at the usual spot', date: 'Apr 5, 2026', emoji: '☕' },
    { id: '5', type: 'message', description: 'Sent birthday message', date: 'Mar 15, 2026', emoji: '🎂' },
  ]
}

export default function TimelineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { sentLog, contactNotes } = useStore()

  const person = PEOPLE.find((p) => p.id === id)
  if (!person) return null

  const timeline = mockTimeline()
  const sentMessages = sentLog.filter((s) => s.personId === id)
  const notes = (contactNotes[id] ?? []).slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const totalInteractions = timeline.length + sentMessages.length + notes.length

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>{person.first}'s timeline</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.personRow}>
          <Avatar initial={person.initial} size={44} />
          <View>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.personSub}>{totalInteractions} interactions recorded</Text>
          </View>
        </View>

        {/* Voice & text notes from captures */}
        {notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Notes from Naer</Text>
            {notes.map((note, i) => (
              <View key={note.id} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.fading }]} />
                  {i < notes.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.entryCard}>
                  {note.uri
                    ? <Mic size={18} color={colors.accent} />
                    : <Text style={styles.entryEmoji}>📝</Text>}
                  <View style={styles.entryContent}>
                    <Text style={styles.entryDesc}>{note.text}</Text>
                    <Text style={styles.entryDate}>
                      {new Date(note.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {note.uri ? '  🎤 voice note' : ''}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Messages sent via Naer */}
        {sentMessages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sent via Naer</Text>
            {sentMessages.map((msg, i) => (
              <View key={msg.id} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: colors.accent }]} />
                  {i < sentMessages.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.entryCard}>
                  <Text style={styles.entryEmoji}>💬</Text>
                  <View style={styles.entryContent}>
                    <Text style={styles.entryDesc}>Sent “{msg.tone}” message</Text>
                    <Text style={styles.entryDate}>{new Date(msg.sentAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>History</Text>
          {timeline.map((entry, i) => (
            <View key={entry.id} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: colors.accent2 }]} />
                {i < timeline.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.entryCard}>
                <Text style={styles.entryEmoji}>{entry.emoji}</Text>
                <View style={styles.entryContent}>
                  <Text style={styles.entryDesc}>{entry.description}</Text>
                  <Text style={styles.entryDate}>{entry.date}</Text>
                </View>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.small },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surface, marginHorizontal: 16, borderRadius: 16, ...shadow.small, marginBottom: 8 },
  personName: { fontFamily: fonts.uiMedium, fontSize: 16, color: colors.ink },
  personSub: { fontFamily: fonts.ui, fontSize: 13, color: colors.muted, marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionLabel: { fontFamily: fonts.uiSemiBold, fontSize: 12, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  timelineRow: { flexDirection: 'row', marginBottom: 16 },
  timelineLeft: { width: 24, alignItems: 'center', marginRight: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 14 },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.line, marginTop: 4 },
  entryCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, gap: 10, ...shadow.small },
  entryContent: { flex: 1 },
  entryDesc: { fontFamily: fonts.uiMedium, fontSize: 14, color: colors.ink },
  entryDate: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted, marginTop: 2 },
  entryEmoji: { fontSize: 20 },
})
