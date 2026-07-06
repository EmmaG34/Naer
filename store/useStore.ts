import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
}

export interface SentMessage {
  id: string
  personId: string
  personName: string
  message: string
  tone: string
  sentAt: Date
}

export interface Capture {
  id: string
  type: 'voice' | 'text'
  content: string
  uri?: string
  createdAt: Date
}

interface AppStore {
  currentUser: { name: string; email: string; avatar: string }
  setCurrentUserName: (name: string) => void
  toasts: Toast[]
  showToast: (msg: string) => void
  dismissToast: (id: string) => void
  sentLog: SentMessage[]
  addSentMessage: (msg: SentMessage) => void
  captures: Capture[]
  addCapture: (capture: Capture) => void
  favorites: string[]
  toggleFavorite: (id: string) => void
  muted: string[]
  toggleMute: (id: string) => void
  hasOnboarded: boolean
  setHasOnboarded: (val: boolean) => void
  notificationsEnabled: boolean
  setNotificationsEnabled: (val: boolean) => void
}

let toastCounter = 0
let captureCounter = 0

export const useStore = create<AppStore>((set) => ({
  currentUser: {
    name: '',
    email: 'maya@example.com',
    avatar: 'M',
  },
  setCurrentUserName: (name: string) =>
    set((state) => ({
      currentUser: {
        ...state.currentUser,
        name,
        avatar: name.charAt(0).toUpperCase() || 'M',
      },
    })),
  toasts: [],
  showToast: (msg: string) => {
    const id = String(++toastCounter)
    set((state) => ({ toasts: [...state.toasts, { id, message: msg }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  dismissToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
  sentLog: [],
  addSentMessage: (msg: SentMessage) => {
    set((state) => ({ sentLog: [msg, ...state.sentLog] }))
  },
  captures: [],
  addCapture: (capture: Capture) => {
    set((state) => ({ captures: [capture, ...state.captures] }))
  },
  favorites: ['1', '2'],
  toggleFavorite: (id: string) => {
    set((state) => ({
      favorites: state.favorites.includes(id)
        ? state.favorites.filter((f) => f !== id)
        : [...state.favorites, id],
    }))
  },
  muted: [],
  toggleMute: (id: string) => {
    set((state) => ({
      muted: state.muted.includes(id)
        ? state.muted.filter((m) => m !== id)
        : [...state.muted, id],
    }))
  },
  hasOnboarded: false,
  setHasOnboarded: (val: boolean) => set({ hasOnboarded: val }),
  notificationsEnabled: false,
  setNotificationsEnabled: (val: boolean) => set({ notificationsEnabled: val }),
}))
