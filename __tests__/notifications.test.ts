import * as Notifications from 'expo-notifications'
import {
  requestNotificationPermissions,
  scheduleDailyNudge,
  cancelAllNotifications,
} from '../utils/notifications'
import { PEOPLE } from '../store/data'

describe('requestNotificationPermissions', () => {
  it('returns true immediately when already granted', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({ status: 'granted' } as any)
    const result = await requestNotificationPermissions()
    expect(result).toBe(true)
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled()
  })

  it('requests permission and returns true when user grants', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({ status: 'undetermined' } as any)
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({ status: 'granted' } as any)
    const result = await requestNotificationPermissions()
    expect(result).toBe(true)
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1)
  })

  it('returns false when user denies', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({ status: 'undetermined' } as any)
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({ status: 'denied' } as any)
    const result = await requestNotificationPermissions()
    expect(result).toBe(false)
  })
})

describe('scheduleDailyNudge', () => {
  it('schedules a notification containing the person name', async () => {
    const person = PEOPLE[0]
    await scheduleDailyNudge(person)
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining(person.first),
          data: expect.objectContaining({ personId: person.id, type: 'nudge' }),
        }),
        trigger: expect.objectContaining({ hour: 9, minute: 0 }),
      })
    )
  })

  it('cancels previous nudge notifications before scheduling', async () => {
    jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValueOnce([
      { identifier: 'old-nudge', content: { data: { type: 'nudge' } }, trigger: {} } as any,
    ])
    await scheduleDailyNudge(PEOPLE[0])
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-nudge')
  })

  it('does not cancel birthday notifications', async () => {
    jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValueOnce([
      { identifier: 'bday-1', content: { data: { type: 'birthday' } }, trigger: {} } as any,
    ])
    await scheduleDailyNudge(PEOPLE[0])
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('bday-1')
  })
})

describe('cancelAllNotifications', () => {
  it('cancels all scheduled notifications', async () => {
    await cancelAllNotifications()
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled()
  })

  it('resets the badge count to zero', async () => {
    await cancelAllNotifications()
    expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(0)
  })
})
