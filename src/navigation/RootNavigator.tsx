import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import BlitzScreen from '../screens/BlitzScreen';
import GameScreen from '../screens/GameScreen';
import HomeScreen from '../screens/HomeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ModeSelectScreen from '../screens/ModeSelectScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { usePlayerStore } from '../state/playerStore';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const activeMode = usePlayerStore((s) => s.activeMode);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={activeMode ? 'Home' : 'ModeSelect'}>
        <Stack.Screen name="ModeSelect" component={ModeSelectScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Blitz" component={BlitzScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ headerShown: true, title: 'Leaderboard' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
