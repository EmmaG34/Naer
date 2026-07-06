import { useStore, resetStore } from '../store/useStore'

beforeEach(() => resetStore())

describe('toasts', () => {
  it('showToast adds a toast with the correct message', () => {
    useStore.getState().showToast('Hello world')
    const { toasts } = useStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Hello world')
  })

  it('showToast assigns a unique id', () => {
    useStore.getState().showToast('A')
    useStore.getState().showToast('B')
    const ids = useStore.getState().toasts.map((t) => t.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('dismissToast removes by id', () => {
    useStore.getState().showToast('Hello')
    const id = useStore.getState().toasts[0].id
    useStore.getState().dismissToast(id)
    expect(useStore.getState().toasts).toHaveLength(0)
  })

  it('dismissToast leaves other toasts intact', () => {
    useStore.getState().showToast('A')
    useStore.getState().showToast('B')
    const id = useStore.getState().toasts[0].id
    useStore.getState().dismissToast(id)
    expect(useStore.getState().toasts).toHaveLength(1)
    expect(useStore.getState().toasts[0].message).toBe('A')
  })
})

describe('favorites', () => {
  it('toggleFavorite adds a new id', () => {
    useStore.getState().toggleFavorite('99')
    expect(useStore.getState().favorites).toContain('99')
  })

  it('toggleFavorite removes an existing id', () => {
    useStore.setState({ favorites: ['1', '2'] })
    useStore.getState().toggleFavorite('1')
    expect(useStore.getState().favorites).not.toContain('1')
    expect(useStore.getState().favorites).toContain('2')
  })

  it('toggling twice restores original state', () => {
    useStore.setState({ favorites: [] })
    useStore.getState().toggleFavorite('5')
    useStore.getState().toggleFavorite('5')
    expect(useStore.getState().favorites).not.toContain('5')
  })
})

describe('muted', () => {
  it('toggleMute adds an id', () => {
    useStore.getState().toggleMute('p1')
    expect(useStore.getState().muted).toContain('p1')
  })

  it('toggleMute removes an existing id', () => {
    useStore.getState().toggleMute('p1')
    useStore.getState().toggleMute('p1')
    expect(useStore.getState().muted).not.toContain('p1')
  })
})

describe('followUps', () => {
  const makeFu = (id = 'fu-1') => ({
    id,
    description: 'Grab coffee',
    dueDate: '2026-08-01',
    createdAt: new Date(),
    completed: false,
  })

  it('addFollowUp prepends newest first', () => {
    useStore.getState().addFollowUp(makeFu('fu-1'))
    useStore.getState().addFollowUp(makeFu('fu-2'))
    expect(useStore.getState().followUps[0].id).toBe('fu-2')
    expect(useStore.getState().followUps).toHaveLength(2)
  })

  it('completeFollowUp marks completed true', () => {
    useStore.getState().addFollowUp(makeFu())
    useStore.getState().completeFollowUp('fu-1')
    expect(useStore.getState().followUps[0].completed).toBe(true)
  })

  it('completeFollowUp does not affect other follow-ups', () => {
    useStore.getState().addFollowUp(makeFu('fu-1'))
    useStore.getState().addFollowUp(makeFu('fu-2'))
    useStore.getState().completeFollowUp('fu-1')
    const fu2 = useStore.getState().followUps.find((f) => f.id === 'fu-2')
    expect(fu2?.completed).toBe(false)
  })

  it('dismissFollowUp removes entirely', () => {
    useStore.getState().addFollowUp(makeFu())
    useStore.getState().dismissFollowUp('fu-1')
    expect(useStore.getState().followUps).toHaveLength(0)
  })

  it('dismissFollowUp leaves other follow-ups intact', () => {
    useStore.getState().addFollowUp(makeFu('fu-1'))
    useStore.getState().addFollowUp(makeFu('fu-2'))
    useStore.getState().dismissFollowUp('fu-1')
    expect(useStore.getState().followUps).toHaveLength(1)
    expect(useStore.getState().followUps[0].id).toBe('fu-2')
  })
})

describe('contactNotes', () => {
  it('groups notes by personId', () => {
    useStore.getState().addContactNote({ id: 'n1', personId: 'p1', text: 'A', createdAt: new Date() })
    useStore.getState().addContactNote({ id: 'n2', personId: 'p1', text: 'B', createdAt: new Date() })
    useStore.getState().addContactNote({ id: 'n3', personId: 'p2', text: 'C', createdAt: new Date() })
    expect(useStore.getState().contactNotes['p1']).toHaveLength(2)
    expect(useStore.getState().contactNotes['p2']).toHaveLength(1)
  })

  it('prepends newest note first within a person', () => {
    useStore.getState().addContactNote({ id: 'n1', personId: 'p1', text: 'First', createdAt: new Date() })
    useStore.getState().addContactNote({ id: 'n2', personId: 'p1', text: 'Second', createdAt: new Date() })
    expect(useStore.getState().contactNotes['p1'][0].id).toBe('n2')
  })

  it('does not bleed across different people', () => {
    useStore.getState().addContactNote({ id: 'n1', personId: 'p1', text: 'A', createdAt: new Date() })
    expect(useStore.getState().contactNotes['p2']).toBeUndefined()
  })
})

describe('setCurrentUserName', () => {
  it('updates the name', () => {
    useStore.getState().setCurrentUserName('Sophie')
    expect(useStore.getState().currentUser.name).toBe('Sophie')
  })

  it('derives the avatar initial from the first character', () => {
    useStore.getState().setCurrentUserName('Rachel')
    expect(useStore.getState().currentUser.avatar).toBe('R')
  })

  it('falls back to M for empty string', () => {
    useStore.getState().setCurrentUserName('')
    expect(useStore.getState().currentUser.avatar).toBe('M')
  })

  it('preserves the email', () => {
    useStore.getState().setCurrentUserName('Alice')
    expect(useStore.getState().currentUser.email).toBe('maya@example.com')
  })
})

describe('resetStore', () => {
  it('clears follow-ups added during a test', () => {
    useStore.getState().addFollowUp({ id: 'x', description: 'test', createdAt: new Date(), completed: false })
    resetStore()
    expect(useStore.getState().followUps).toHaveLength(0)
  })

  it('resets currentUser name', () => {
    useStore.getState().setCurrentUserName('Changed')
    resetStore()
    expect(useStore.getState().currentUser.name).toBe('')
  })

  it('resets hasOnboarded', () => {
    useStore.getState().setHasOnboarded(true)
    resetStore()
    expect(useStore.getState().hasOnboarded).toBe(false)
  })
})
