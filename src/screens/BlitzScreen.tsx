import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import BlitzPauseOverlay from '../components/BlitzPauseOverlay';
import BlitzResultModal from '../components/BlitzResultModal';
import BoardView from '../components/BoardView';
import ComboPopup, { ComboEvent } from '../components/ComboPopup';
import CountdownOverlay from '../components/CountdownOverlay';
import FireBanner from '../components/FireBanner';
import FireIgniteOverlay from '../components/FireIgniteOverlay';
import {
  clearMatches,
  collapseColumns,
  findAnyValidMove,
  findMatchedPositions,
  generateBoard,
  hasAnyValidMove,
  scoreForClear,
  trySwap,
} from '../game/board';
import { chainTierFor, getComboMessage } from '../game/combo';
import { startMusic, setMusicTier, stopMusic, pauseMusic, resumeMusic } from '../game/music';
import { playSound, SoundName } from '../game/sound';
import { COLORS } from '../game/theme';
import { Board, Position } from '../game/types';
import { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../state/playerStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Blitz'>;

export const BLITZ_DURATION_SECONDS = 60;
const FIRE_WINDOW_MS = 2000;
const FIRE_THRESHOLD = 5;
const IGNITE_PAUSE_MS = 1300;
const COUNTDOWN_TICK_MS = 900;
const TICKING_THRESHOLD_SECONDS = 5;
const MUSIC_INTENSE_THRESHOLD_SECONDS = 5;
const HINT_IDLE_MS = 5000;

function musicTierForTime(secondsLeft: number): 'calm' | 'intense' {
  return secondsLeft <= MUSIC_INTENSE_THRESHOLD_SECONDS ? 'intense' : 'calm';
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function BlitzScreen({ navigation }: Props) {
  const blitzBestScore = usePlayerStore((s) => s.blitzBestScore);
  const completeBlitzRun = usePlayerStore((s) => s.completeBlitzRun);

  const [board, setBoard] = useState<Board>(() => generateBoard());
  const [selected, setSelected] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BLITZ_DURATION_SECONDS);
  const [started, setStarted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [countdownValue, setCountdownValue] = useState<number | 'GO' | null>(null);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [poppingIds, setPoppingIds] = useState<Set<number>>(new Set());
  const [fallSeed, setFallSeed] = useState(0);
  const [swapPair, setSwapPair] = useState<{ a: Position; b: Position } | null>(null);
  const [comboEvent, setComboEvent] = useState<ComboEvent | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [runReward, setRunReward] = useState<{
    coinsEarned: number;
    rank: number;
    milestones: { top10: boolean; top3: boolean; first: boolean };
  } | null>(null);
  const [fireActive, setFireActive] = useState(false);
  const [igniting, setIgniting] = useState(false);
  const [hint, setHint] = useState<{ a: Position; b: Position } | null>(null);
  const [paused, setPaused] = useState(false);

  const swapProgress = useRef(new Animated.Value(0)).current;
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const lastMatchAtRef = useRef<number | null>(null);
  const fireActiveRef = useRef(false);
  const lastActionAtRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number | null>(null);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (!started || finished || paused) return;
    const watchdog = setInterval(() => {
      if (
        fireActiveRef.current &&
        lastMatchAtRef.current !== null &&
        Date.now() - lastMatchAtRef.current > FIRE_WINDOW_MS
      ) {
        fireActiveRef.current = false;
        streakRef.current = 0;
        setFireActive(false);
      }
    }, 400);
    return () => clearInterval(watchdog);
  }, [started, finished, paused]);

  useEffect(() => {
    if (!started || finished || paused) return;
    const watchdog = setInterval(() => {
      if (busy || igniting) return;
      if (Date.now() - lastActionAtRef.current >= HINT_IDLE_MS) {
        setHint(findAnyValidMove(board));
        // Re-arm rather than leave it stuck on: if they're still idle after
        // this, the hint re-appears (or refreshes) every HINT_IDLE_MS.
        lastActionAtRef.current = Date.now();
      }
    }, 500);
    return () => clearInterval(watchdog);
  }, [started, finished, paused, busy, igniting, board]);

  useEffect(() => {
    if (!started || finished || igniting || paused) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        const next = Math.max(0, t - 1);
        if (next > 0 && next <= TICKING_THRESHOLD_SECONDS) playSound('tick');
        if (next > 0) setMusicTier(musicTierForTime(next));
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, finished, igniting, paused]);

  useEffect(() => {
    if (started && !finished) {
      startMusic('calm');
    }
  }, [started, finished]);

  useEffect(() => {
    // Safety net: always silence Blitz music if this screen goes away,
    // regardless of how (back button, finishing, navigating elsewhere).
    return () => stopMusic();
  }, []);

  useEffect(() => {
    if (started && !finished && timeLeft === 0) {
      finishRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Auto-pause when the app/tab loses focus (backgrounded, tab switched,
  // etc.) so players can't be timed out by something outside the game.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && started && !finished && !pausedAtRef.current) {
        pausedAtRef.current = Date.now();
        setPaused(true);
        pauseMusic();
      }
    });
    return () => sub.remove();
  }, [started, finished]);

  const pauseRun = () => {
    if (!started || finished || paused) return;
    pausedAtRef.current = Date.now();
    setPaused(true);
    pauseMusic();
  };

  const resumeRun = () => {
    if (!paused) return;
    const pauseDurationMs = pausedAtRef.current !== null ? Date.now() - pausedAtRef.current : 0;
    pausedAtRef.current = null;
    // Shift the "time since last match/action" clocks forward by however
    // long we were paused, so the pause itself can never be what expires
    // fire or triggers an idle hint - mirrors the ignite-pause fix above.
    if (lastMatchAtRef.current !== null) lastMatchAtRef.current += pauseDurationMs;
    lastActionAtRef.current += pauseDurationMs;
    setPaused(false);
    resumeMusic();
  };

  const startRun = async () => {
    setShowIntro(false);
    setResultVisible(false);
    setBoard(generateBoard());
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(BLITZ_DURATION_SECONDS);
    setFinished(false);
    setSelected(null);
    setPoppingIds(new Set());
    setFallSeed((s) => s + 1);
    streakRef.current = 0;
    lastMatchAtRef.current = null;
    fireActiveRef.current = false;
    setFireActive(false);
    setIgniting(false);
    setHint(null);
    lastActionAtRef.current = Date.now();
    pausedAtRef.current = null;
    setPaused(false);

    for (const value of [3, 2, 1] as const) {
      setCountdownValue(value);
      playSound('beep');
      await delay(COUNTDOWN_TICK_MS);
    }
    setCountdownValue('GO');
    playSound('go');
    await delay(COUNTDOWN_TICK_MS * 0.6);
    setCountdownValue(null);
    setStarted(true);
  };

  const finishRun = () => {
    if (finished) return;
    setFinished(true);
    stopMusic();
    const total = scoreRef.current;
    setFinalScore(total);
    const result = completeBlitzRun(total);
    setIsNewBest(result.isNewBest);
    setRunReward({ coinsEarned: result.coinsEarned, rank: result.rank, milestones: result.milestones });
    const bigWin = result.isNewBest || result.milestones.top10 || result.milestones.top3 || result.milestones.first;
    playSound(bigWin ? 'newbest' : 'lose');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResultVisible(true);
  };

  const runCascades = async (startingBoard: Board) => {
    let current = startingBoard;
    let runningScore = score;
    let cascadeIndex = 0;

    while (true) {
      const matches = findMatchedPositions(current);
      if (matches.length === 0) break;

      const clearedIds = new Set(matches.map(({ row, col }) => current[row][col]!.id));
      const basePoints = scoreForClear(matches.length);
      const points = fireActiveRef.current ? basePoints * 2 : basePoints;
      const combo = getComboMessage(matches.length, cascadeIndex, points);
      const label = fireActiveRef.current ? `${combo.label} 🔥x2`.trim() : combo.label;
      setComboEvent({ id: Date.now() + cascadeIndex, label, points: combo.points });
      setPoppingIds(clearedIds);
      playSound(cascadeIndex > 0 ? 'combo' : 'pop');
      const chainTier = chainTierFor(matches.length, cascadeIndex);
      if (chainTier > 0) playSound(`chain${chainTier}` as SoundName);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(150);

      current = collapseColumns(clearMatches(current, matches));
      runningScore += points;
      cascadeIndex += 1;

      setBoard(current);
      setScore(runningScore);
      setPoppingIds(new Set());
      setFallSeed((s) => s + 1);
      await delay(180);
    }

    setBusy(false);

    if (!hasAnyValidMove(current)) {
      setBoard(generateBoard());
      setFallSeed((s) => s + 1);
    }
  };

  const onTilePress = (pos: Position) => {
    if (!started || busy || finished || igniting || paused) return;
    lastActionAtRef.current = Date.now();
    setHint(null);
    if (!selected) {
      setSelected(pos);
      playSound('tap');
      return;
    }
    if (selected.row === pos.row && selected.col === pos.col) {
      setSelected(null);
      return;
    }
    const from = selected;
    const { board: nextBoard, valid } = trySwap(board, from, pos);
    setSelected(null);

    if (!valid) {
      playSound('invalid');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const now = Date.now();
    const withinWindow = lastMatchAtRef.current !== null && now - lastMatchAtRef.current <= FIRE_WINDOW_MS;
    const newStreak = withinWindow ? streakRef.current + 1 : 1;
    streakRef.current = newStreak;
    lastMatchAtRef.current = now;
    const justIgnited = newStreak >= FIRE_THRESHOLD && !fireActiveRef.current;
    if (justIgnited) {
      fireActiveRef.current = true;
      setFireActive(true);
    }

    setBusy(true);
    setSwapPair({ a: from, b: pos });
    swapProgress.setValue(0);
    Animated.timing(swapProgress, { toValue: 1, duration: 130, useNativeDriver: true }).start(async () => {
      setSwapPair(null);
      swapProgress.setValue(0);
      setBoard(nextBoard);

      if (justIgnited) {
        setIgniting(true);
        playSound('fire');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await delay(IGNITE_PAUSE_MS);
        setIgniting(false);
        // The ignite freeze is a forced celebration, not the player slowing
        // down - restart the fire-pace clock from when they regain control
        // so the freeze itself can never be what makes fire expire.
        lastMatchAtRef.current = Date.now();
      }

      runCascades(nextBoard);
    });
  };

  const timeLow = timeLeft <= 10;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={12}>
          <Text style={styles.iconButtonText}>{'←'}</Text>
        </Pressable>
        <Text style={styles.title}>{'⏱ Blitz'}</Text>
        {started && !finished ? (
          <Pressable onPress={pauseRun} style={styles.iconButton} hitSlop={12}>
            <Text style={styles.iconButtonText}>{'⏸'}</Text>
          </Pressable>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeLabel}>Score</Text>
          <Text style={styles.statBadgeValue}>{score}</Text>
        </View>
        <View style={[styles.statBadge, timeLow && styles.statBadgeDanger]}>
          <Text style={styles.statBadgeLabel}>Time left</Text>
          <Text style={[styles.statBadgeValue, timeLow && styles.statBadgeValueDanger]}>{timeLeft}s</Text>
        </View>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeLabel}>Best</Text>
          <Text style={styles.statBadgeValue}>{blitzBestScore}</Text>
        </View>
      </View>

      <View style={[styles.boardWrap, fireActive && styles.boardWrapOnFire]}>
        <FireBanner active={fireActive} />
        <CountdownOverlay value={countdownValue} />
        <ComboPopup event={comboEvent} />
        <BoardView
          board={board}
          selected={selected}
          onTilePress={onTilePress}
          poppingIds={poppingIds}
          fallSeed={fallSeed}
          swap={swapPair ? { a: swapPair.a, b: swapPair.b, progress: swapProgress } : null}
          hint={hint}
        />

        {showIntro && (
          <View style={styles.startOverlay}>
            <Text style={styles.startTitle}>Blitz Mode</Text>
            <Text style={styles.startBody}>
              {BLITZ_DURATION_SECONDS} seconds. No moves limit, no target - just chase the highest score you can and
              see how you stack up against your friends.
            </Text>
            <Pressable style={styles.startButton} onPress={startRun}>
              <Text style={styles.startButtonText}>Start</Text>
            </Pressable>
          </View>
        )}
      </View>

      <BlitzResultModal
        visible={resultVisible}
        score={finalScore}
        bestScore={Math.max(finalScore, blitzBestScore)}
        isNewBest={isNewBest}
        coinsEarned={runReward?.coinsEarned ?? 0}
        rank={runReward?.rank ?? null}
        milestones={runReward?.milestones ?? null}
        onPlayAgain={startRun}
        onDone={() => navigation.goBack()}
      />

      <FireIgniteOverlay visible={igniting} />
      <BlitzPauseOverlay visible={paused} onResume={resumeRun} onQuit={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statBadge: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statBadgeDanger: {
    backgroundColor: 'rgba(255,94,91,0.18)',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  statBadgeLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  statBadgeValue: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginTop: 2 },
  statBadgeValueDanger: { color: COLORS.danger },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  boardWrapOnFire: {
    borderColor: '#FF7A1A',
  },
  startOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18,20,43,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  startTitle: { color: COLORS.text, fontSize: 26, fontWeight: '800' },
  startBody: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  startButtonText: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
});
