module.exports = {
  preset: 'jest-expo',
  clearMocks: true,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|native-base|react-native-svg|lucide-react-native)',
  ],
  moduleNameMapper: {
    '^expo-router$': '<rootDir>/__mocks__/expo-router.ts',
    '^expo-av$': '<rootDir>/__mocks__/expo-av.ts',
    '^expo-notifications$': '<rootDir>/__mocks__/expo-notifications.ts',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
}
