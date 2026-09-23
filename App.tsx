import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/game/theme';
import { setMusicMuted } from './src/game/music';
import { setMuted } from './src/game/sound';
import { usePlayerStore } from './src/state/playerStore';

export default function App() {
  const hydrate = usePlayerStore((s) => s.hydrate);
  const hydrated = usePlayerStore((s) => s.hydrated);
  const soundEnabled = usePlayerStore((s) => s.soundEnabled);
  const musicEnabled = usePlayerStore((s) => s.musicEnabled);
  const themeMode = usePlayerStore((s) => s.themeMode);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate().then(() => setReady(true));
  }, [hydrate]);

  useEffect(() => {
    setMuted(!soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    setMusicMuted(!musicEnabled);
  }, [musicEnabled]);

  if (!ready || !hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
