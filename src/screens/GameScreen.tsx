import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import BoardView from '../components/BoardView';
import HowToPlayModal from '../components/HowToPlayModal';
import { getLevel, starsForScore } from '../data/levels';
import {
  clearMatches,
  collapseColumns,
  findMatchedPositions,
  generateBoard,
  hasAnyValidMove,
  scoreForClear,
  trySwap,
} from '../game/board';
import { playSound } from '../game/sound';
import { COLORS } from '../game/theme';
import { Board, Position } from '../game/types';
import { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../state/playerStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function GameScreen({ route, navigation }: Props) {
  const { levelId } = route.params;
  const level = getLevel(levelId)!;
  const spendLife = usePlayerStore((s) => s.spendLife);
  const completeLevel = usePlayerStore((s) => s.completeLevel);
  const hasSeenHowToPlay = usePlayerStore((s) => s.hasSeenHowToPlay);
  const markHowToPlaySeen = usePlayerStore((s) => s.markHowToPlaySeen);

  const [board, setBoard] = useState<Board>(() => generateBoard());
  const [selected, setSelected] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(level.moveLimit);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [poppingIds, setPoppingIds] = useState<Set<number>>(new Set());
  const [fallSeed, setFallSeed] = useState(0);
  const [swapPair, setSwapPair] = useState<{ a: Position; b: Position } | null>(null);
  const [howToPlayVisible, setHowToPlayVisible] = useState(!hasSeenHowToPlay);
  const swapProgress = useRef(new Animated.Value(0)).current;
  const lifeSpentRef = useRef(false);

  useEffect(() => {
    if (!lifeSpentRef.current) {
      lifeSpentRef.current = true;
      const ok = spendLife();
      if (!ok) {
        Alert.alert('Out of lives', 'Wait for a life to regenerate before playing.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    }
  }, [navigation, spendLife]);

  const closeHowToPlay = () => {
    setHowToPlayVisible(false);
    markHowToPlaySeen();
  };

  const finishLevel = (finalScore: number) => {
    if (finished) return;
    setFinished(true);
    const stars = starsForScore(finalScore, level);
    completeLevel(level.id, finalScore, stars);
    const won = stars > 0;
    playSound(won ? 'win' : 'lose');
    Haptics.notificationAsync(
      won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    Alert.alert(
      won ? 'Level complete!' : 'Out of moves',
      won
        ? `You scored ${finalScore} pts and earned ${stars} star${stars === 1 ? '' : 's'}!`
        : `You reached ${finalScore} / ${level.targetScore} pts. Try again?`,
      [{ text: 'Continue', onPress: () => navigation.goBack() }]
    );
  };

  const runCascades = async (startingBoard: Board, movesRemaining: number) => {
    let current = startingBoard;
    let runningScore = score;
    let cascadeIndex = 0;

    while (true) {
      const matches = findMatchedPositions(current);
      if (matches.length === 0) break;

      const clearedIds = new Set(matches.map(({ row, col }) => current[row][col]!.id));
      setPoppingIds(clearedIds);
      playSound(cascadeIndex > 0 ? 'combo' : 'pop');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(180);

      current = collapseColumns(clearMatches(current, matches));
      runningScore += scoreForClear(matches.length);
      cascadeIndex += 1;

      setBoard(current);
      setScore(runningScore);
      setPoppingIds(new Set());
      setFallSeed((s) => s + 1);
      await delay(240);
    }

    setBusy(false);

    if (runningScore >= level.targetScore) {
      finishLevel(runningScore);
      return;
    }
    if (movesRemaining <= 0) {
      finishLevel(runningScore);
      return;
    }
    if (!hasAnyValidMove(current)) {
      setBoard(generateBoard());
      setFallSeed((s) => s + 1);
    }
  };

  const onTilePress = (pos: Position) => {
    if (busy || finished) return;
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
    setBusy(true);
    setSwapPair({ a: from, b: pos });
    swapProgress.setValue(0);
    Animated.timing(swapProgress, { toValue: 1, duration: 150, useNativeDriver: true }).start(() => {
      setSwapPair(null);
      swapProgress.setValue(0);
      const nextMoves = movesLeft - 1;
      setMovesLeft(nextMoves);
      setBoard(nextBoard);
      runCascades(nextBoard, nextMoves);
    });
  };

  const progressPct = Math.min(100, Math.round((score / level.targetScore) * 100));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={12}>
          <Text style={styles.iconButtonText}>{'←'}</Text>
        </Pressable>
        <Text style={styles.levelName}>{level.name}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={() => setHowToPlayVisible(true)} style={styles.iconButton} hitSlop={12}>
            <Text style={styles.iconButtonText}>{'?'}</Text>
          </Pressable>
          <Text style={styles.moves}>Moves: {movesLeft}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>
      <Text style={styles.scoreText}>{score} / {level.targetScore} pts</Text>

      <View style={styles.boardWrap}>
        <BoardView
          board={board}
          selected={selected}
          onTilePress={onTilePress}
          poppingIds={poppingIds}
          fallSeed={fallSeed}
          swap={swapPair ? { a: swapPair.a, b: swapPair.b, progress: swapProgress } : null}
        />
      </View>

      <HowToPlayModal visible={howToPlayVisible} onClose={closeHowToPlay} />
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
  levelName: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  moves: { color: COLORS.textMuted, fontWeight: '600', alignSelf: 'center' },
  progressTrack: {
    height: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  scoreText: {
    color: COLORS.textMuted,
    marginTop: 6,
    fontSize: 12,
  },
  boardWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
