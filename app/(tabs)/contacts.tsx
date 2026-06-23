import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Search, Plus } from 'lucide-react-native'
import { colors, fonts, shadow } from '../../constants/tokens'
import { PEOPLE, Person } from '../../store/data'
import { Avatar } from '../../components/ui/Avatar'
import { Chip } from '../../components/ui/Chip'
import { StatusDot } from '../../components/ui/StatusDot'

type FilterType = 'All' | 'Needs you' | 'Family' | 'School mums' | 'Work'
const FILTERS: FilterType[] = ['All', 'Needs you', 'Family', 'School mums', 'Work']

function filterPeople(people: Person[], filter: FilterType, query: string): Person[] {
  let result = people

  if (query.trim()) {
    const q = query.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.relation.toLowerCase().includes(q)
    )
  }

  if (filter === 'Needs you') result = result.filter((p) => p.status === 'needs')
  else if (filter === 'Family') result = result.filter((p) => p.relation.toLowerCase().includes('family') || p.relation === 'Mum' || p.relation === 'Dad')
  else if (filter === 'School mums') result = result.filter((p) => p.relation.toLowerCase().includes('school'))
  else if (filter === 'Work') result = result.filter((p) => p.relation.toLowerCase().includes('work'))

  return result
}

function alphabetize(people: Person[]): Record<string, Person[]> {
  return people.reduce<Record<string, Person[]>>((acc, person) => {
    const letter = person.name[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(person)
    return acc
  }, {})
}

export default function ContactsScreen() {
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<FilterType>('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => filterPeople(PEOPLE, filter, query), [filter, query])
  const grouped = useMemo(() => alphabetize(filtered), [filtered])
  const letters = useMemo(() => Object.keys(grouped).sort(), [grouped])

  const quickAccess = PEOPLE.filter((p) => p.tier === 'close')

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Contacts</Text>
        <Pressable
          onPress={() => router.push('/add-contact')}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
        >
          <Plus size={20} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={16} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search people..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {filter === 'All' && !query && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quick access</Text>
            <View style={styles.quickRow}>
              {quickAccess.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/person/${p.id}`)}
                  style={styles.quickItem}
                >
                  <Avatar initial={p.initial} size={48} />
                  <Text style={styles.quickName}>{p.first}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {letters.map((letter) => (
          <View key={letter}>
            <Text style={styles.letterHeader}>{letter}</Text>
            {(grouped[letter] ?? []).map((person) => (
              <Pressable
                key={person.id}
                onPress={() => router.push(`/person/${person.id}`)}
                style={({ pressed }) => [styles.personRow, pressed && { opacity: 0.7 }]}
              >
                <Avatar initial={person.initial} size={44} />
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personRelation}>{person.relation}</Text>
                </View>
                <View style={styles.personRight}>
                  <Text style={styles.lastText}>{person.last}</Text>
                  <StatusDot status={person.status} />
                </View>
              </Pressable>
            ))}
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    ...shadow.small,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.ink,
  },
  filtersScroll: { marginBottom: 8 },
  filtersContent: { paddingHorizontal: 20, gap: 8 },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionLabel: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  quickRow: { flexDirection: 'row', gap: 16 },
  quickItem: { alignItems: 'center', gap: 6 },
  quickName: { fontFamily: fonts.ui, fontSize: 12, color: colors.ink },
  letterHeader: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: colors.bg,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  personInfo: { flex: 1, marginLeft: 14 },
  personName: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink },
  personRelation: { fontFamily: fonts.ui, fontSize: 13, color: colors.muted, marginTop: 2 },
  personRight: { alignItems: 'flex-end', gap: 6 },
  lastText: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fonts.ui, fontSize: 15, color: colors.muted },
})
