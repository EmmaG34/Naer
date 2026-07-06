export interface ParsedFollowUp {
  description: string
  personName: string | null
  dueDate: string | null
}

export interface ParsedInfoUpdate {
  field: string
  value: string
}

export interface ParsedTranscript {
  followUps: ParsedFollowUp[]
  infoUpdates: ParsedInfoUpdate[]
}

// Swap in real Claude once EXPO_PUBLIC_ANTHROPIC_KEY is set in .env
export async function parseTranscript(
  transcript: string,
  fetcher: typeof fetch = fetch
): Promise<ParsedTranscript> {
  // --- Real Claude implementation (uncomment when key is ready) ---
  // const res = await fetcher('https://api.anthropic.com/v1/messages', {
  //   method: 'POST',
  //   headers: {
  //     'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_KEY ?? '',
  //     'anthropic-version': '2023-06-01',
  //     'content-type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: 'claude-haiku-4-5-20251001',
  //     max_tokens: 512,
  //     messages: [{
  //       role: 'user',
  //       content: `Extract structured info from this voice note transcript.\n\nTranscript: "${transcript}"\n\nReturn ONLY valid JSON (no markdown):\n{\n  "followUps": [{ "description": "short action", "personName": "name or null", "dueDate": "YYYY-MM-DD or null" }],\n  "infoUpdates": [{ "field": "category", "value": "fact" }]\n}\n\nRules: only add followUps if meeting/calling/reaching out is mentioned; use today+7 for 'soon', today+14 for unspecified; only add infoUpdates for concrete facts; descriptions under 8 words; empty arrays if nothing applies`,
  //     }],
  //   }),
  // })
  // const json = await res.json()
  // try { return JSON.parse(json.content?.[0]?.text ?? '{}') }
  // catch { return { followUps: [], infoUpdates: [] } }
  // ----------------------------------------------------------------

  // Mock: ~0.8s simulated latency
  await new Promise((r) => setTimeout(r, 800))

  const lower = transcript.toLowerCase()
  const mentionsCoffee = lower.includes('coffee') || lower.includes('catch up') || lower.includes('catch-up')
  const mentionsCall = lower.includes('call') || lower.includes('phone')
  const mentionsProject = lower.includes('project') || lower.includes('work') || lower.includes('job')
  const mentionsMoved = lower.includes('mov') || lower.includes('house') || lower.includes('flat')

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const twoWeeks = new Date()
  twoWeeks.setDate(twoWeeks.getDate() + 14)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const followUps: ParsedFollowUp[] = []
  const infoUpdates: ParsedInfoUpdate[] = []

  if (mentionsCoffee) {
    followUps.push({ description: 'Grab coffee together', personName: null, dueDate: fmt(nextWeek) })
  } else if (mentionsCall) {
    followUps.push({ description: 'Give them a call', personName: null, dueDate: fmt(nextWeek) })
  } else {
    followUps.push({ description: 'Follow up and check in', personName: null, dueDate: fmt(twoWeeks) })
  }

  if (mentionsProject) {
    infoUpdates.push({ field: 'Work update', value: 'New project going well — stressed but excited' })
  }
  if (mentionsMoved) {
    infoUpdates.push({ field: 'Life update', value: 'Recently moved / moving house' })
  }
  if (!mentionsProject && !mentionsMoved) {
    infoUpdates.push({ field: 'General note', value: transcript.slice(0, 80).trim() })
  }

  return { followUps, infoUpdates }
}
