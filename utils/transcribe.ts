// Swap in real Whisper once EXPO_PUBLIC_OPENAI_KEY is set in .env
export async function transcribeAudio(_uri: string): Promise<string> {
  // --- Real Whisper implementation (uncomment when key is ready) ---
  // const formData = new FormData()
  // formData.append('file', { uri: _uri, type: 'audio/m4a', name: 'recording.m4a' } as any)
  // formData.append('model', 'whisper-1')
  // const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}` },
  //   body: formData,
  // })
  // const json = await res.json()
  // return json.text ?? ''
  // -----------------------------------------------------------------

  // Mock: simulates ~1.8s transcription latency
  await new Promise((r) => setTimeout(r, 1800))
  return "Had a really good catch-up. Mentioned the new project is going really well — stressed but excited about it. Wants to grab coffee properly soon."
}
