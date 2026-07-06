const mockRecording = {
  stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
  getURI: jest.fn().mockReturnValue('file://mock-recording.m4a'),
}

const mockSound = {
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  setOnPlaybackStatusUpdate: jest.fn(),
}

export const Audio = {
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  Recording: {
    createAsync: jest.fn().mockResolvedValue({ recording: mockRecording }),
  },
  RecordingOptionsPresets: {
    HIGH_QUALITY: {},
  },
  Sound: {
    createAsync: jest.fn().mockResolvedValue({ sound: mockSound }),
  },
}
