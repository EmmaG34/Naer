import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { Person } from '../store/data'

const MONTH_MAP: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Naer',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function scheduleDailyNudge(person: Person): Promise<void> {
  // Cancel existing nudges before scheduling a fresh one
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const n of scheduled) {
    if (n.content.data?.type === 'nudge') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier)
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Say hello to ${person.first} 👋`,
      body: `${person.name} would love to hear from you today.`,
      data: { personId: person.id, type: 'nudge' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  })
}

export async function scheduleBirthdayReminders(people: Person[]): Promise<void> {
  // Cancel existing birthday notifications
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const n of scheduled) {
    if (n.content.data?.type === 'birthday') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier)
    }
  }

  for (const person of people) {
    if (!person.birthday) continue
    const parts = person.birthday.split(' ')
    if (parts.length < 2) continue
    const month = MONTH_MAP[parts[0]]
    const day = parseInt(parts[1], 10)
    if (!month || isNaN(day)) continue

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎂 ${person.first}'s birthday today!`,
        body: `Send ${person.first} a birthday message — they'll love it.`,
        data: { personId: person.id, type: 'birthday' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        month,
        day,
        hour: 8,
        minute: 0,
        repeats: true,
      },
    })
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
  await Notifications.setBadgeCountAsync(0)
}
