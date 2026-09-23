import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BlitzScreen from '../screens/BlitzScreen';
import GameScreen from '../screens/GameScreen';
import HomeScreen from '../screens/HomeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ModeSelectScreen from '../screens/ModeSelectScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ShopScreen from '../screens/ShopScreen';
import { useColors } from '../game/theme';
import { usePlayerStore } from '../state/playerStore';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const activeMode = usePlayerStore((s) => s.activeMode);
  const themeMode = usePlayerStore((s) => s.themeMode);
  const COLORS = useColors();
  const navTheme = {
    ...(themeMode === 'light' ? DefaultTheme : DarkTheme),
    colors: {
      ...(themeMode === 'light' ? DefaultTheme.colors : DarkTheme.colors),
      background: COLORS.background,
      card: COLORS.surface,
      text: COLORS.text,
      border: COLORS.surfaceLight,
      primary: COLORS.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={activeMode ? 'Home' : 'ModeSelect'}>
        <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Blitz" component={BlitzScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ headerShown: true, title: 'Leaderboard' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
        <Stack.Screen name="Shop" component={ShopScreen} options={{ headerShown: true, title: 'Shop' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
