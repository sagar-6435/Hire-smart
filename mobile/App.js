import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';

import RoleSelectionScreen from './screens/RoleSelectionScreen';
import ResumeUploadScreen from './screens/ResumeUploadScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import ResultScreen from './screens/ResultScreen';
import { COLORS } from './utils/constants';

// ─── Keep splash visible until we call hideAsync() ────────────────────────────
SplashScreen.preventAutoHideAsync();

// ─── How long to show the splash screen (milliseconds) ────────────────────────
const SPLASH_DURATION = 2500; // 2.5 seconds

const Stack = createNativeStackNavigator();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate any asset/font loading here
        await new Promise((resolve) => setTimeout(resolve, SPLASH_DURATION));
      } catch (e) {
        console.warn('App preparation error:', e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      // Hide splash and fade app in
      await SplashScreen.hideAsync();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <StatusBar style="light" />

        <Stack.Navigator
          initialRouteName="RoleSelection"
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.card },
            headerTintColor: COLORS.textPrimary,
            headerTitleStyle: { fontWeight: '700', fontSize: 17 },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: COLORS.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="RoleSelection"
            component={RoleSelectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResumeUpload"
            component={ResumeUploadScreen}
            options={{ title: 'Upload Resume' }}
          />
          <Stack.Screen
            name="Processing"
            component={ProcessingScreen}
            options={{
              title: 'Analyzing…',
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{
              title: 'Screening Result',
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>

        {/* Toast notifications */}
        <Toast />
      </NavigationContainer>
    </Animated.View>
  );
}
