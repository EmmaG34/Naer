import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Tabs, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Home, Users, Calendar, User } from 'lucide-react-native'
import { colors, fonts } from '../../constants/tokens'

function CustomTabBar({ state, descriptors, navigation }: {
  state: { index: number; routes: { key: string; name: string }[] }
  descriptors: Record<string, { options: { tabBarLabel?: string; title?: string } }>
  navigation: { emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean }; navigate: (name: string) => void }
}) {
  const insets = useSafeAreaInsets()

  const tabs = [
    { name: 'index', label: 'Home', Icon: Home },
    { name: 'contacts', label: 'Contacts', Icon: Users },
    { name: '__fab__', label: '', Icon: null },
    { name: 'dates', label: 'Dates', Icon: Calendar },
    { name: 'profile', label: 'You', Icon: User },
  ]

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {tabs.map((tab, index) => {
        if (tab.name === '__fab__') {
          return (
            <Pressable
              key="fab"
              onPress={() => router.push('/tell-naer')}
              style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.93 }] }]}
            >
              <Text style={styles.fabPlus}>+</Text>
            </Pressable>
          )
        }

        const routeIndex = state.routes.findIndex((r) => r.name === tab.name)
        const isFocused = state.index === routeIndex
        const { Icon } = tab

        const onPress = () => {
          if (routeIndex === -1) return
          const route = state.routes[routeIndex]
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name)
          }
        }

        return (
          <Pressable key={tab.name} onPress={onPress} style={styles.tabItem}>
            {Icon && (
              <Icon
                size={22}
                color={isFocused ? colors.accent : colors.muted}
                strokeWidth={isFocused ? 2.5 : 1.8}
              />
            )}
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...(props as Parameters<typeof CustomTabBar>[0])} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="contacts" options={{ title: 'Contacts' }} />
      <Tabs.Screen name="dates" options={{ title: 'Dates' }} />
      <Tabs.Screen name="profile" options={{ title: 'You' }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  tabLabel: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.accent,
    fontFamily: fonts.uiMedium,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPlus: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
    marginTop: -2,
  },
})
