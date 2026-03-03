import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// Screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import SubmitPhotoScreen from '../screens/SubmitPhotoScreen';
import RevealScreen from '../screens/RevealScreen';
import GalleryScreen from '../screens/GalleryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const SPLASH_EMOJIS = ['📸', '❤️', '💕', '🥰', '✨', '💖', '🌸', '💗', '😍', '🫶', '💘', '🎉', '🦋', '🌈', '💐'];

// Animated emoji splash shown once on app launch
function SplashEmoji({ onFinish }) {
  const emoji = useRef(SPLASH_EMOJIS[Math.floor(Math.random() * SPLASH_EMOJIS.length)]).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pop in: scale up + fade in
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Hold for 1 second, then fade out
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(onFinish);
      }, 1000);
    });
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F0' }}>
      <Animated.Text
        style={{
          fontSize: 80,
          transform: [{ scale }],
          opacity,
        }}
      >
        {emoji}
      </Animated.Text>
    </View>
  );
}

// Animated bouncing dots loader
const DOT_COLORS = ['#FF6B6B', '#FF8E8E', '#FFB347'];

function BouncingDots() {
  const anims = useRef(DOT_COLORS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );
    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: DOT_COLORS[i],
            transform: [{
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -18],
              }),
            }, {
              scale: anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.3, 1],
              }),
            }],
            opacity: anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.6, 1, 0.6],
            }),
          }}
        />
      ))}
    </View>
  );
}

// Bottom tab navigator — the main app shell with Home, Gallery, and Profile tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#8E8E8E',
        tabBarStyle: {
          backgroundColor: '#FFF8F0',
          borderTopColor: '#FFE0E6',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#FFF8F0',
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#FFE0E6',
        },
        headerTintColor: '#FF6B6B',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color, size }) => (
            <Icon name="image-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root navigator — shows auth screen when logged out, main app when logged in.
// SubmitPhoto and Reveal are modal screens layered on top of the tabs.
export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Show splash for ~2s total (spring in + hold + fade out), then dismiss
  if (showSplash) {
    return <SplashEmoji onFinish={() => setShowSplash(false)} />;
  }

  // Show fancy loader while checking auth state on app launch
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F0' }}>
        <Icon name="heart-pulse" size={48} color="#FF6B6B" style={{ marginBottom: 24 }} />
        <BouncingDots />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Not logged in — show auth screen
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        // Logged in — show main app with modal screens
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="SubmitPhoto"
            component={SubmitPhotoScreen}
            options={{
              headerShown: true,
              title: 'Submit Photo',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: '#FFF8F0',
                shadowColor: 'transparent',
                elevation: 0,
                borderBottomWidth: 1,
                borderBottomColor: '#FFE0E6',
              },
              headerTintColor: '#FF6B6B',
              headerTitleStyle: { fontWeight: '700' },
            }}
          />
          <Stack.Screen
            name="Reveal"
            component={RevealScreen}
            options={{
              headerShown: true,
              title: 'Reveal Moment',
              presentation: 'modal',
              headerStyle: {
                backgroundColor: '#FFF8F0',
                shadowColor: 'transparent',
                elevation: 0,
                borderBottomWidth: 1,
                borderBottomColor: '#FFE0E6',
              },
              headerTintColor: '#FF6B6B',
              headerTitleStyle: { fontWeight: '700' },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
