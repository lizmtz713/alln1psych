/**
 * Learning Style Quiz — Quick 8-question quiz to discover how you learn best.
 * Can be embedded in onboarding or accessed standalone.
 */
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/lib/constants';
import { useUserStore, type LearningStyle } from '../../src/stores/userStore';
import { useAuth } from '../../src/providers/AuthProvider';
import { updateExtendedProfile } from '../../src/services/profileService';

const ACCENT = '#7C4DFF';

// Each question maps answers to learning styles
interface QuizQuestion {
  question: string;
  options: {
    text: string;
    style: LearningStyle;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "When learning something new, I prefer to...",
    options: [
      { text: "Read about it first", style: 'reading' },
      { text: "Listen to someone explain it", style: 'listening' },
      { text: "Jump in and try it", style: 'doing' },
      { text: "Talk it through with someone", style: 'talking' },
    ],
  },
  {
    question: "I remember things best when I...",
    options: [
      { text: "Write them down or see them written", style: 'reading' },
      { text: "Hear them out loud", style: 'listening' },
      { text: "Practice or experience them", style: 'doing' },
      { text: "Discuss them with others", style: 'talking' },
    ],
  },
  {
    question: "When I'm stuck on a problem, I usually...",
    options: [
      { text: "Look up articles or guides", style: 'reading' },
      { text: "Ask someone to explain it to me", style: 'listening' },
      { text: "Experiment until I figure it out", style: 'doing' },
      { text: "Think out loud or talk through options", style: 'talking' },
    ],
  },
  {
    question: "In a group setting, I learn best by...",
    options: [
      { text: "Reading handouts or slides", style: 'reading' },
      { text: "Listening to the speaker", style: 'listening' },
      { text: "Doing activities or exercises", style: 'doing' },
      { text: "Group discussions", style: 'talking' },
    ],
  },
  {
    question: "When giving directions, I tend to...",
    options: [
      { text: "Write them down or draw a map", style: 'reading' },
      { text: "Explain them verbally, step by step", style: 'listening' },
      { text: "Show them by walking the route", style: 'doing' },
      { text: "Describe landmarks and have a conversation about it", style: 'talking' },
    ],
  },
  {
    question: "I get distracted most easily when...",
    options: [
      { text: "There's visual clutter around me", style: 'reading' },
      { text: "There's background noise", style: 'listening' },
      { text: "I have to sit still for too long", style: 'doing' },
      { text: "I can't ask questions or discuss", style: 'talking' },
    ],
  },
  {
    question: "When I want to relax and learn something fun, I...",
    options: [
      { text: "Read a book or article", style: 'reading' },
      { text: "Listen to a podcast or audiobook", style: 'listening' },
      { text: "Try a hands-on hobby or game", style: 'doing' },
      { text: "Call a friend or join a discussion", style: 'talking' },
    ],
  },
  {
    question: "The best way to teach me something is to...",
    options: [
      { text: "Give me something to read", style: 'reading' },
      { text: "Explain it to me verbally", style: 'listening' },
      { text: "Let me try it myself", style: 'doing' },
      { text: "Have a back-and-forth conversation", style: 'talking' },
    ],
  },
];

const STYLE_INFO: Record<LearningStyle, { emoji: string; title: string; description: string; tips: string[] }> = {
  reading: {
    emoji: '📖',
    title: 'Reading/Writing Learner',
    description: "You learn best through written words. Reading, writing notes, and seeing information in text form helps you absorb and remember it.",
    tips: [
      "Take notes when learning something new",
      "Read articles and books on topics you want to understand",
      "Write summaries in your own words",
      "Use lists and written instructions",
    ],
  },
  listening: {
    emoji: '🎧',
    title: 'Auditory Learner',
    description: "You learn best by hearing information. Lectures, podcasts, and verbal explanations stick with you.",
    tips: [
      "Listen to podcasts and audiobooks",
      "Ask people to explain things out loud",
      "Record voice memos to yourself",
      "Read important things aloud",
    ],
  },
  doing: {
    emoji: '🎮',
    title: 'Kinesthetic Learner',
    description: "You learn best by doing. Hands-on experience, practice, and physical engagement help you understand and remember.",
    tips: [
      "Jump in and try things — learn by doing",
      "Use hands-on exercises and simulations",
      "Take breaks to move around while studying",
      "Practice skills repeatedly",
    ],
  },
  talking: {
    emoji: '💬',
    title: 'Social/Verbal Learner',
    description: "You learn best through conversation. Discussing ideas, teaching others, and thinking out loud helps you process information.",
    tips: [
      "Find a study buddy or discussion partner",
      "Teach concepts to someone else",
      "Think out loud when problem-solving",
      "Join groups or communities around topics you're learning",
    ],
  },
  unknown: {
    emoji: '🤔',
    title: 'Mixed Learner',
    description: "You adapt to different learning styles depending on the situation. This flexibility is a strength!",
    tips: [
      "Experiment with different approaches",
      "Match your method to the content",
      "Combine multiple styles for complex topics",
      "Stay curious about what works for you",
    ],
  },
};

type ScreenMode = 'intro' | 'quiz' | 'result';

export default function LearningStyleQuizScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const setLearningStyle = useUserStore((s) => s.setLearningStyle);
  
  const [mode, setMode] = useState<ScreenMode>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<LearningStyle, number>>({
    reading: 0,
    listening: 0,
    doing: 0,
    talking: 0,
    unknown: 0,
  });
  const [result, setResult] = useState<LearningStyle | null>(null);
  
  const handleStartQuiz = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode('quiz');
  };
  
  const handleAnswer = (style: LearningStyle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newScores = { ...scores, [style]: scores[style] + 1 };
    setScores(newScores);
    
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const { unknown, ...styleScores } = newScores;
      const maxScore = Math.max(...Object.values(styleScores));
      const topStyles = (Object.entries(styleScores) as [LearningStyle, number][])
        .filter(([_, score]) => score === maxScore)
        .map(([style]) => style);
      
      // If there's a clear winner, use it. Otherwise, pick the first tied style.
      const finalStyle = topStyles[0];
      setResult(finalStyle);
      setMode('result');
      setLearningStyle(finalStyle);
      if (authUser?.id && finalStyle !== 'unknown') {
        updateExtendedProfile(authUser.id, { learning_style: finalStyle }).catch(() => {});
      }
    }
  };
  
  const resetQuiz = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentQuestion(0);
    setScores({ reading: 0, listening: 0, doing: 0, talking: 0, unknown: 0 });
    setResult(null);
    setMode('intro');
  };
  
  const question = QUIZ_QUESTIONS[currentQuestion];
  const resultInfo = result ? STYLE_INFO[result] : null;
  const progress = (currentQuestion + 1) / QUIZ_QUESTIONS.length;
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.closeBtn} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="close" size={24} color={COLORS.textMuted} />
        </Pressable>
        
        {mode === 'quiz' && (
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Learning Style</Text>
          </View>
        )}
        
        <View style={{ width: 40 }} />
      </View>
      
      {/* Progress bar - only in quiz mode */}
      {mode === 'quiz' && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}
      
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* INTRO SCREEN */}
        {mode === 'intro' && (
          <View style={styles.introContainer}>
            <Text style={styles.introEmoji}>📚</Text>
            <Text style={styles.introTitle}>Discover Your Learning Style</Text>
            <Text style={styles.introSubtitle}>
              Everyone absorbs information differently. This quick quiz helps identify how you learn best — so InGauge can communicate with you more effectively.
            </Text>
            
            <View style={styles.introInfoCard}>
              <View style={styles.introInfoRow}>
                <Ionicons name="time-outline" size={20} color={ACCENT} />
                <Text style={styles.introInfoText}>Takes about 2 minutes</Text>
              </View>
              <View style={styles.introInfoRow}>
                <Ionicons name="help-circle-outline" size={20} color={ACCENT} />
                <Text style={styles.introInfoText}>8 quick questions</Text>
              </View>
              <View style={styles.introInfoRow}>
                <Ionicons name="sparkles-outline" size={20} color={ACCENT} />
                <Text style={styles.introInfoText}>Personalized tips at the end</Text>
              </View>
            </View>
            
            <Text style={styles.introHint}>
              There are no wrong answers — just pick what feels most natural to you.
            </Text>
            
            <Pressable style={styles.startBtn} onPress={handleStartQuiz}>
              <Text style={styles.startBtnText}>Start Quiz</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </View>
        )}
        
        {/* QUIZ SCREEN */}
        {mode === 'quiz' && (
          <>
            {/* Question */}
            <Text style={styles.questionNumber}>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</Text>
            <Text style={styles.question}>{question.question}</Text>
            
            {/* Options */}
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.optionBtn,
                    pressed && styles.optionBtnPressed,
                  ]}
                  onPress={() => handleAnswer(option.style)}
                >
                  <Text style={styles.optionText}>{option.text}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
        
        {/* RESULT SCREEN */}
        {mode === 'result' && (
          <>
            {/* Result */}
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>{resultInfo?.emoji}</Text>
              <Text style={styles.resultTitle}>{resultInfo?.title}</Text>
              <Text style={styles.resultDescription}>{resultInfo?.description}</Text>
            </View>
            
            {/* Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Tips for You</Text>
              {resultInfo?.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
            
            {/* Score Breakdown */}
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Your Score Breakdown</Text>
              {(['reading', 'listening', 'doing', 'talking'] as LearningStyle[]).map((style) => {
                const info = STYLE_INFO[style];
                const score = scores[style];
                const percentage = Math.round((score / QUIZ_QUESTIONS.length) * 100);
                return (
                  <View key={style} style={styles.breakdownRow}>
                    <Text style={styles.breakdownEmoji}>{info.emoji}</Text>
                    <Text style={styles.breakdownLabel}>{info.title.split(' ')[0]}</Text>
                    <View style={styles.breakdownBarContainer}>
                      <View style={[styles.breakdownBar, { width: `${percentage}%` }]} />
                    </View>
                    <Text style={styles.breakdownPercent}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>
            
            {/* Actions */}
            <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={styles.primaryBtnText}>Done</Text>
            </Pressable>
            
            <Pressable style={styles.secondaryBtn} onPress={resetQuiz}>
              <Text style={styles.secondaryBtnText}>Take Again</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: { 
    width: 40, 
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  // Progress bar
  progressBarContainer: {
    height: 3,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 2,
  },
  
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  // Intro screen
  introContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  introEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  introSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  introInfoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    gap: 16,
  },
  introInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  introInfoText: {
    fontSize: 15,
    color: COLORS.text,
  },
  introHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  startBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  
  // Question
  questionNumber: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 32,
    lineHeight: 32,
  },
  
  // Options
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionBtnPressed: {
    backgroundColor: ACCENT + '20',
    borderColor: ACCENT,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  
  // Result
  resultCard: {
    backgroundColor: ACCENT + '15',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: ACCENT + '30',
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Tips
  tipsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipBullet: {
    fontSize: 16,
    color: ACCENT,
    marginRight: 8,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  
  // Breakdown
  breakdownCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    width: 70,
  },
  breakdownBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 4,
  },
  breakdownPercent: {
    fontSize: 13,
    color: COLORS.textMuted,
    width: 40,
    textAlign: 'right',
  },
  
  // Buttons
  primaryBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: '600',
  },
});
