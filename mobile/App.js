import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import RoleSelectionScreen from './screens/RoleSelectionScreen';
import ResumeUploadScreen from './screens/ResumeUploadScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import ResultScreen from './screens/ResultScreen';
import { COLORS } from './utils/constants';

const Stack = createNativeStackNavigator();

/**
 * Root Navigation
 * Dark-themed native stack with consistent header styling
 */
export default function App() {
  return (
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
  );
}
