import React from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  useFonts,
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
} from '@expo-google-fonts/newsreader'
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk'
import { ToastContainer } from '../components/ui/Toast'

const queryClient = new QueryClient()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  })

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#eef0f7' }} />
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="tell-naer" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="capture" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="person/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="person/[id]/timeline" options={{ headerShown: false }} />
            <Stack.Screen name="compose/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="add-contact" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="health" options={{ headerShown: false }} />
            <Stack.Screen name="connect-phone" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="follow-up-schedules" options={{ headerShown: false }} />
            <Stack.Screen name="privacy" options={{ headerShown: false }} />
          </Stack>
          <ToastContainer />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
