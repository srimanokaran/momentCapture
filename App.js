import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { RelationshipProvider } from './src/contexts/RelationshipContext';
import AppNavigator from './src/navigation/AppNavigator';

// Custom theme — warm coral & orange for a playful couple-friendly vibe
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF6B6B',
    secondary: '#FFB366',
    background: '#FFF8F0',
    surface: '#FFFFFF',
    onSurface: '#2D2D2D',
    onSurfaceVariant: '#8E8E8E',
  },
};

// App entry point — wraps the entire app in:
// 1. PaperProvider for Material Design UI theming
// 2. AuthProvider for login/logout state
// 3. RelationshipProvider for weekly prompt & submission data
// 4. NavigationContainer for React Navigation
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <RelationshipProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </RelationshipProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
