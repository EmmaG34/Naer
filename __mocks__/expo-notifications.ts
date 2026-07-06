export const getPermissionsAsync = jest.fn().mockResolvedValue({ status: 'undetermined' })
export const requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' })
export const setNotificationChannelAsync = jest.fn().mockResolvedValue(undefined)
export const setNotificationHandler = jest.fn()
export const scheduleNotificationAsync = jest.fn().mockResolvedValue('mock-notification-id')
export const getAllScheduledNotificationsAsync = jest.fn().mockResolvedValue([])
export const cancelScheduledNotificationAsync = jest.fn().mockResolvedValue(undefined)
export const cancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined)
export const setBadgeCountAsync = jest.fn().mockResolvedValue(undefined)
export const addNotificationResponseReceivedListener = jest.fn().mockReturnValue({ remove: jest.fn() })
export const getLastNotificationResponseAsync = jest.fn().mockResolvedValue(null)
export const AndroidImportance = { DEFAULT: 3 }
export const SchedulableTriggerInputTypes = {
  DAILY: 'daily',
  CALENDAR: 'calendar',
  DATE: 'date',
}
