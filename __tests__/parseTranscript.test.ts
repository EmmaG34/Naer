import { parseTranscript } from '../utils/parseTranscript'

beforeAll(() => jest.useFakeTimers())
afterAll(() => jest.useRealTimers())

async function parse(transcript: string) {
  const promise = parseTranscript(transcript)
  jest.runAllTimers()
  return promise
}

describe('follow-up extraction', () => {
  it('detects "coffee" → Grab coffee together', async () => {
    const { followUps } = await parse('we should grab coffee next week')
    expect(followUps[0].description).toBe('Grab coffee together')
  })

  it('detects "catch up" → Grab coffee together', async () => {
    const { followUps } = await parse('lets catch up properly soon')
    expect(followUps[0].description).toBe('Grab coffee together')
  })

  it('detects "call" → Give them a call', async () => {
    const { followUps } = await parse('i should give her a call soon')
    expect(followUps[0].description).toBe('Give them a call')
  })

  it('detects "phone" → Give them a call', async () => {
    const { followUps } = await parse('will phone her later this week')
    expect(followUps[0].description).toBe('Give them a call')
  })

  it('falls back to generic follow-up', async () => {
    const { followUps } = await parse('just a random note about someone')
    expect(followUps[0].description).toBe('Follow up and check in')
  })

  it('always returns exactly one follow-up from mock', async () => {
    const { followUps } = await parse('met up with someone')
    expect(followUps).toHaveLength(1)
  })

  it('dueDate is always in YYYY-MM-DD format', async () => {
    const { followUps } = await parse('something happened')
    expect(followUps[0].dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('dueDate is always in the future', async () => {
    const { followUps } = await parse('coffee next week')
    const due = new Date(followUps[0].dueDate!)
    expect(due.getTime()).toBeGreaterThan(Date.now())
  })

  it('coffee sets dueDate ~7 days out', async () => {
    const { followUps } = await parse('grab coffee soon')
    const due = new Date(followUps[0].dueDate!)
    const diffDays = Math.round((due.getTime() - Date.now()) / 86_400_000)
    expect(diffDays).toBeGreaterThanOrEqual(6)
    expect(diffDays).toBeLessThanOrEqual(8)
  })

  it('generic follow-up sets dueDate ~14 days out', async () => {
    const { followUps } = await parse('had a nice chat')
    const due = new Date(followUps[0].dueDate!)
    const diffDays = Math.round((due.getTime() - Date.now()) / 86_400_000)
    expect(diffDays).toBeGreaterThanOrEqual(13)
    expect(diffDays).toBeLessThanOrEqual(15)
  })
})

describe('info update extraction', () => {
  it('detects "project" → Work update', async () => {
    const { infoUpdates } = await parse('the new project is going really well')
    expect(infoUpdates.some((u) => u.field === 'Work update')).toBe(true)
  })

  it('detects "job" → Work update', async () => {
    const { infoUpdates } = await parse('she got a new job recently')
    expect(infoUpdates.some((u) => u.field === 'Work update')).toBe(true)
  })

  it('detects "moved" → Life update', async () => {
    const { infoUpdates } = await parse('she just moved into a new flat')
    expect(infoUpdates.some((u) => u.field === 'Life update')).toBe(true)
  })

  it('detects "house" → Life update', async () => {
    const { infoUpdates } = await parse('buying a house at the moment')
    expect(infoUpdates.some((u) => u.field === 'Life update')).toBe(true)
  })

  it('falls back to General note when no keywords match', async () => {
    const { infoUpdates } = await parse('had a nice chat')
    expect(infoUpdates[0].field).toBe('General note')
  })

  it('General note value is truncated to 80 chars', async () => {
    const { infoUpdates } = await parse('x'.repeat(200))
    expect(infoUpdates[0].value.length).toBeLessThanOrEqual(80)
  })
})

describe('return shape', () => {
  it('always returns followUps and infoUpdates arrays', async () => {
    const result = await parse('test input')
    expect(Array.isArray(result.followUps)).toBe(true)
    expect(Array.isArray(result.infoUpdates)).toBe(true)
  })

  it('fetcher param is accepted without breaking mock path', async () => {
    const dummyFetcher = jest.fn()
    const promise = parseTranscript('test', dummyFetcher)
    jest.runAllTimers()
    const result = await promise
    // Mock path ignores the fetcher; real path (when uncommented) calls it
    expect(dummyFetcher).not.toHaveBeenCalled()
    expect(result.followUps).toBeDefined()
  })
})
