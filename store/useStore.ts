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

export interface ContactNote {
  id: string
  personId: string
  text: string
  uri?: string
  createdAt: Date
}

export interface FollowUp {
  id: string
  personId?: string
  personName?: string
  description: string
  dueDate?: string // YYYY-MM-DD
  createdAt: Date
  completed: boolean
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
  contactNotes: Record<string, ContactNote[]>
  addContactNote: (note: ContactNote) => void
  followUps: FollowUp[]
  addFollowUp: (fu: FollowUp) => void
  completeFollowUp: (id: string) => void
  dismissFollowUp: (id: string) => void
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

export const useStore = create<AppStore>((set) => ({
  currentUser: { name: '', email: 'maya@example.com', avatar: 'M' },
  setCurrentUserName: (name) =>
    set((s) => ({ currentUser: { ...s.currentUser, name, avatar: name.charAt(0).toUpperCase() || 'M' } })),
  toasts: [],
  showToast: (msg) => {
    const id = String(++toastCounter)
    set((s) => ({ toasts: [...s.toasts, { id, message: msg }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  sentLog: [],
  addSentMessage: (msg) => set((s) => ({ sentLog: [msg, ...s.sentLog] })),
  captures: [],
  addCapture: (capture) => set((s) => ({ captures: [capture, ...s.captures] })),
  contactNotes: {},
  addContactNote: (note) =>
    set((s) => ({
      contactNotes: {
        ...s.contactNotes,
        [note.personId]: [note, ...(s.contactNotes[note.personId] ?? [])],
      },
    })),
  followUps: [],
  addFollowUp: (fu) => set((s) => ({ followUps: [fu, ...s.followUps] })),
  completeFollowUp: (id) =>
    set((s) => ({ followUps: s.followUps.map((f) => f.id === id ? { ...f, completed: true } : f) })),
  dismissFollowUp: (id) =>
    set((s) => ({ followUps: s.followUps.filter((f) => f.id !== id) })),
  favorites: ['1', '2'],
  toggleFavorite: (id) =>
    set((s) => ({
      favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
    })),
  muted: [],
  toggleMute: (id) =>
    set((s) => ({
      muted: s.muted.includes(id) ? s.muted.filter((m) => m !== id) : [...s.muted, id],
    })),
  hasOnboarded: false,
  setHasOnboarded: (val) => set({ hasOnboarded: val }),
  notificationsEnabled: false,
  setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),
}))
