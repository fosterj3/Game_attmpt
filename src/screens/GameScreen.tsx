import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import BoardView from '../components/BoardView';
import ComboPopup, { ComboEvent } from '../components/ComboPopup';
import DialogueModal from '../components/DialogueModal';
import HowToPlayModal from '../components/HowToPlayModal';
import InfoModal from '../components/InfoModal';
import LevelResultModal from '../components/LevelResultModal';
import WagerModal from '../components/WagerModal';
import { getLevel, starsForScore } from '../data/levels';
import { getChapter } from '../data/story';
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
import { playSound, SoundName } from '../game/sound';
import { COLORS } from '../game/theme';
import { Board, Position } from '../game/types';
import { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../state/playerStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

type StoryPhase = 'before' | 'wager' | 'playing' | 'after' | null;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GameScreen({ route, navigation }: Props) {
  const { levelId } = route.params;
  const level = getLevel(levelId)!;
  const chapter = getChapter(levelId);
  const spendLife = usePlayerStore((s) => s.spendLife);
  const completeLevel = usePlayerStore((s) => s.completeLevel);
  const hasSeenHowToPlay = usePlayerStore((s) => s.hasSeenHowToPlay);
  const markHowToPlaySeen = usePlayerStore((s) => s.markHowToPlaySeen);
  const activeMode = usePlayerStore((s) => s.activeMode);
  const lives = usePlayerStore((s) => s.lives);
  const resolveWager = usePlayerStore((s) => s.resolveWager);
  const inventory = usePlayerStore((s) => s.inventory);
  const consumeBoost = usePlayerStore((s) => s.consumeBoost);
  const isStory = activeMode === 'story' && !!chapter;
  const hasTimer = level.timeLimitSeconds != null;

  const [board, setBoard] = useState<Board>(() => generateBoard());
  const [selected, setSelected] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(level.moveLimit);
  const [timeLeft, setTimeLeft] = useState<number | null>(level.timeLimitSeconds ?? null);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [poppingIds, setPoppingIds] = useState<Set<number>>(new Set());
  const [fallSeed, setFallSeed] = useState(0);
  const [swapPair, setSwapPair] = useState<{ a: Position; b: Position } | null>(null);
  const [comboEvent, setComboEvent] = useState<ComboEvent | null>(null);
  const [howToPlayVisible, setHowToPlayVisible] = useState(!hasSeenHowToPlay && !isStory);
  const [storyPhase, setStoryPhase] = useState<StoryPhase>(isStory ? 'before' : 'playing');
  const [outOfLivesVisible, setOutOfLivesVisible] = useState(false);
  const [wagerAccepted, setWagerAccepted] = useState(false);
  const [hint, setHint] = useState<{ a: Position; b: Position } | null>(null);
  const [freezeActive, setFreezeActive] = useState(false);
  const [result, setResult] = useState<{
    won: boolean;
    score: number;
    stars: 0 | 1 | 2 | 3;
    coinsEarned: number;
    moveBonusCoins: number;
    wagerResult: { heartsDelta: number; coinsBonus: number } | null;
  } | null>(null);

  const swapProgress = useRef(new Animated.Value(0)).current;
  const attemptStartedRef = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const startAttempt = (): boolean => {
    const ok = spendLife();
    if (!ok) {
      setOutOfLivesVisible(true);
      return false;
    }
    setBoard(generateBoard());
    setScore(0);
    scoreRef.current = 0;
    setMovesLeft(level.moveLimit);
    setTimeLeft(level.timeLimitSeconds ?? null);
    setFinished(false);
    setSelected(null);
    setPoppingIds(new Set());
    setFallSeed((s) => s + 1);
    setHint(null);
    setFreezeActive(false);
    return true;
  };

  useEffect(() => {
    if (attemptStartedRef.current) return;
    if (isStory) return; // wait for the "before" dialogue to finish
    attemptStartedRef.current = true;
    startAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPaused = storyPhase !== 'playing' || howToPlayVisible || outOfLivesVisible || !!result;

  useEffect(() => {
    if (!hasTimer || isPaused || finished || freezeActive) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => (t === null ? t : Math.max(0, t - 1)));
    }, 1000);
    return () => clearInterval(interval);
  }, [hasTimer, isPaused, finished, freezeActive]);

  useEffect(() => {
    if (hasTimer && timeLeft === 0 && !finished) {
      finishLevel(scoreRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const closeHowToPlay = () => {
    setHowToPlayVisible(false);
    markHowToPlaySeen();
  };

  const handleBeforeDialogueDone = () => {
    setStoryPhase('wager');
  };

  const handleWagerChoice = (accept: boolean) => {
    setWagerAccepted(accept);
    attemptStartedRef.current = true;
    const ok = startAttempt();
    setStoryPhase(ok ? 'playing' : null);
    if (ok && !hasSeenHowToPlay) setHowToPlayVisible(true);
  };

  const handleAfterDialogueDone = () => {
    navigation.goBack();
  };

  const finishLevel = (finalScore: number, movesRemaining: number = movesLeft) => {
    if (finished) return;
    setFinished(true);
    const stars = starsForScore(finalScore, level);
    const { coinsEarned, bonusCoins } = completeLevel(level.id, finalScore, stars, movesRemaining);
    const won = stars > 0;
    playSound(won ? 'win' : 'lose');
    Haptics.notificationAsync(
      won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    const wagerResult = isStory && wagerAccepted ? resolveWager(won) : null;
    setResult({ won, score: finalScore, stars, coinsEarned, moveBonusCoins: bonusCoins, wagerResult });
  };

  const handleResultContinue = () => {
    setResult(null);
    if (result?.won && isStory) {
      setStoryPhase('after');
    } else {
      navigation.goBack();
    }
  };

  const handleRetry = () => {
    setResult(null);
    startAttempt();
  };

  const runCascades = async (startingBoard: Board, movesRemaining: number) => {
    let current = startingBoard;
    let runningScore = score;
    let cascadeIndex = 0;

    while (true) {
      const matches = findMatchedPositions(current);
      if (matches.length === 0) break;

      const clearedIds = new Set(matches.map(({ row, col }) => current[row][col]!.id));
      const points = scoreForClear(matches.length);
      const combo = getComboMessage(matches.length, cascadeIndex, points);
      setComboEvent({ id: Date.now() + cascadeIndex, label: combo.label, points: combo.points });
      setPoppingIds(clearedIds);
      playSound(cascadeIndex > 0 ? 'combo' : 'pop');
      const chainTier = chainTierFor(matches.length, cascadeIndex);
      if (chainTier > 0) playSound(`chain${chainTier}` as SoundName);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await delay(180);

      current = collapseColumns(clearMatches(current, matches));
      runningScore += points;
      cascadeIndex += 1;

      setBoard(current);
      setScore(runningScore);
      setPoppingIds(new Set());
      setFallSeed((s) => s + 1);
      await delay(240);
    }

    setBusy(false);

    if (runningScore >= level.targetScore) {
      finishLevel(runningScore, movesRemaining);
      return;
    }
    if (movesRemaining <= 0) {
      finishLevel(runningScore, movesRemaining);
      return;
    }
    if (!hasAnyValidMove(current)) {
      setBoard(generateBoard());
      setFallSeed((s) => s + 1);
    }
  };

  const canUseBoosts = storyPhase === 'playing' && !busy && !finished;

  const useHintBoost = () => {
    if (!canUseBoosts || inventory.hint <= 0) return;
    const move = findAnyValidMove(board);
    if (!move) return;
    if (!consumeBoost('hint')) return;
    playSound('tap');
    setHint(move);
    setTimeout(() => setHint(null), 2500);
  };

  const useExtraMovesBoost = () => {
    if (finished || inventory.extraMoves <= 0) return;
    if (!consumeBoost('extraMoves')) return;
    playSound('tap');
    setMovesLeft((m) => m + 3);
  };

  const useFreezeBoost = () => {
    if (!hasTimer || finished || freezeActive || inventory.freezeTime <= 0) return;
    if (!consumeBoost('freezeTime')) return;
    playSound('tap');
    setFreezeActive(true);
    setTimeout(() => setFreezeActive(false), 10000);
  };

  const onTilePress = (pos: Position) => {
    if (storyPhase !== 'playing' || busy || finished) return;
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
  const headerTitle = isStory && chapter ? chapter.title : level.name;
  const movesLow = movesLeft <= 3;
  const timeLow = hasTimer && (timeLeft ?? 0) <= 10;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={12}>
          <Text style={styles.iconButtonText}>{'←'}</Text>
        </Pressable>
        <Text style={styles.levelName} numberOfLines={1}>
          {headerTitle}
        </Text>
        <Pressable onPress={() => setHowToPlayVisible(true)} style={styles.iconButton} hitSlop={12}>
          <Text style={styles.iconButtonText}>{'?'}</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statBadge, movesLow && styles.statBadgeDanger]}>
          <Text style={styles.statBadgeLabel}>Moves left</Text>
          <Text style={[styles.statBadgeValue, movesLow && styles.statBadgeValueDanger]}>{movesLeft}</Text>
        </View>
        {hasTimer && (
          <View style={[styles.statBadge, timeLow && styles.statBadgeDanger, freezeActive && styles.statBadgeFrozen]}>
            <Text style={styles.statBadgeLabel}>{freezeActive ? '❄️ Frozen' : '⏱ Time left'}</Text>
            <Text style={[styles.statBadgeValue, timeLow && styles.statBadgeValueDanger]}>
              {formatTime(timeLeft ?? 0)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.boostRow}>
        <Pressable
          onPress={useHintBoost}
          disabled={!canUseBoosts || inventory.hint <= 0}
          style={[styles.boostButton, (!canUseBoosts || inventory.hint <= 0) && styles.boostButtonDisabled]}
        >
          <Text style={styles.boostEmoji}>{'💡'}</Text>
          <Text style={styles.boostCount}>{inventory.hint}</Text>
        </Pressable>
        <Pressable
          onPress={useExtraMovesBoost}
          disabled={finished || inventory.extraMoves <= 0}
          style={[styles.boostButton, (finished || inventory.extraMoves <= 0) && styles.boostButtonDisabled]}
        >
          <Text style={styles.boostEmoji}>{'➕'}</Text>
          <Text style={styles.boostCount}>{inventory.extraMoves}</Text>
        </Pressable>
        {hasTimer && (
          <Pressable
            onPress={useFreezeBoost}
            disabled={finished || freezeActive || inventory.freezeTime <= 0}
            style={[
              styles.boostButton,
              (finished || freezeActive || inventory.freezeTime <= 0) && styles.boostButtonDisabled,
            ]}
          >
            <Text style={styles.boostEmoji}>{'❄️'}</Text>
            <Text style={styles.boostCount}>{inventory.freezeTime}</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>
      <Text style={styles.scoreText}>{score} / {level.targetScore} pts</Text>

      <View style={styles.boardWrap}>
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
      </View>

      <HowToPlayModal visible={howToPlayVisible} onClose={closeHowToPlay} />

      {isStory && chapter && (
        <>
          <DialogueModal
            visible={storyPhase === 'before'}
            chapterTitle={chapter.title}
            lines={chapter.before}
            onDone={handleBeforeDialogueDone}
          />
          <WagerModal
            visible={storyPhase === 'wager'}
            hearts={lives}
            onAccept={() => handleWagerChoice(true)}
            onDecline={() => handleWagerChoice(false)}
          />
          <DialogueModal visible={storyPhase === 'after'} lines={chapter.after} onDone={handleAfterDialogueDone} />
        </>
      )}

      {result && (
        <LevelResultModal
          visible
          won={result.won}
          score={result.score}
          target={level.targetScore}
          stars={result.stars}
          coinsEarned={result.coinsEarned}
          moveBonusCoins={result.moveBonusCoins}
          wagerResult={result.wagerResult}
          onContinue={handleResultContinue}
          onRetry={handleRetry}
        />
      )}

      <InfoModal
        visible={outOfLivesVisible}
        title="Out of lives"
        message="Wait for a life to regenerate before playing again."
        onClose={() => {
          setOutOfLivesVisible(false);
          navigation.goBack();
        }}
      />
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
  levelName: { color: COLORS.text, fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center' },
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
  statBadgeFrozen: {
    backgroundColor: 'rgba(76,154,255,0.18)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  boostRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  boostButton: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  boostButtonDisabled: { opacity: 0.35 },
  boostEmoji: { fontSize: 16 },
  boostCount: { color: COLORS.text, fontWeight: '800', fontSize: 13 },
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
