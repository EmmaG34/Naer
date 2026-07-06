import { Audio } from 'expo-av'

let activeRecording: Audio.Recording | null = null
let activeSound: Audio.Sound | null = null

export async function requestAudioPermissions(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync()
  return status === 'granted'
}

export async function startRecording(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  })
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  )
  activeRecording = recording
}

export async function stopRecording(): Promise<string | null> {
  if (!activeRecording) return null
  try {
    await activeRecording.stopAndUnloadAsync()
  } catch {
    // already stopped
  }
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
  const uri = activeRecording.getURI() ?? null
  activeRecording = null
  return uri
}

export async function playAudio(uri: string): Promise<Audio.Sound> {
  if (activeSound) {
    await activeSound.unloadAsync()
    activeSound = null
  }
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  })
  const { sound } = await Audio.Sound.createAsync({ uri })
  activeSound = sound
  await sound.playAsync()
  return sound
}

export async function stopPlayback(): Promise<void> {
  if (activeSound) {
    await activeSound.stopAsync()
    await activeSound.unloadAsync()
    activeSound = null
  }
}

export function resetAudioState(): void {
  activeRecording = null
  activeSound = null
}
