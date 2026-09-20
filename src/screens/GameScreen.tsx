import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import BoardView from '../components/BoardView';
import { getLevel, starsForScore } from '../data/levels';
import { generateBoard, hasAnyValidMove, resolveCascades, scoreForClear, trySwap } from '../game/board';
import { COLORS } from '../game/theme';
import { Board, Position } from '../game/types';
import { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../state/playerStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export default function GameScreen({ route, navigation }: Props) {
  const { levelId } = route.params;
  const level = getLevel(levelId)!;
  const spendLife = usePlayerStore((s) => s.spendLife);
  const completeLevel = usePlayerStore((s) => s.completeLevel);

  const [board, setBoard] = useState<Board>(() => generateBoard());
  const [selected, setSelected] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(level.moveLimit);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
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

  const finishLevel = (finalScore: number) => {
    if (finished) return;
    setFinished(true);
    const stars = starsForScore(finalScore, level);
    completeLevel(level.id, finalScore, stars);
    const won = stars > 0;
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
    setBusy(true);
    const steps = resolveCascades(startingBoard);
    let runningScore = score;
    let latestBoard = startingBoard;

    for (const step of steps) {
      runningScore += scoreForClear(step.clearedCount);
      latestBoard = step.board;
      setBoard(step.board);
      setScore(runningScore);
      await new Promise((resolve) => setTimeout(resolve, 260));
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
    if (!hasAnyValidMove(latestBoard)) {
      setBoard(generateBoard());
    }
  };

  const onTilePress = (pos: Position) => {
    if (busy || finished) return;
    if (!selected) {
      setSelected(pos);
      return;
    }
    if (selected.row === pos.row && selected.col === pos.col) {
      setSelected(null);
      return;
    }
    const { board: nextBoard, valid } = trySwap(board, selected, pos);
    setSelected(null);
    if (!valid) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextMoves = movesLeft - 1;
    setMovesLeft(nextMoves);
    setBoard(nextBoard);
    runCascades(nextBoard, nextMoves);
  };

  const progressPct = Math.min(100, Math.round((score / level.targetScore) * 100));

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.quitButton} hitSlop={12}>
          <Text style={styles.quitButtonText}>{'←'}</Text>
        </Pressable>
        <Text style={styles.levelName}>{level.name}</Text>
        <Text style={styles.moves}>Moves left: {movesLeft}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>
      <Text style={styles.scoreText}>{score} / {level.targetScore} pts</Text>

      <View style={styles.boardWrap}>
        <BoardView board={board} selected={selected} onTilePress={onTilePress} />
      </View>
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
  quitButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  levelName: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  moves: { color: COLORS.textMuted, fontWeight: '600' },
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
