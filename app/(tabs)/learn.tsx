import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { useEducationStore } from '../../src/stores/educationStore';
import {
  MANUAL_SECTIONS,
  getAllManualLessonIds,
  type ManualSection,
  type ManualLesson,
} from '../../src/data/manualContent';
import {
  type Discovery,
  getDiscoveriesForDay,
  getMoreDiscoveries,
  getCategoryTag,
} from '../../src/data/discoveries';

// Design System
const COLORS = {
  bg: '#09090F',
  card: '#111118',
  cardElevated: '#18181F',
  border: 'rgba(255,255,255,0.06)',
  text: '#F0F0F5',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',
  accent: '#7C4DFF',
  accentSoft: 'rgba(124,77,255,0.12)',
  success: '#4ADE80',
  successSoft: 'rgba(74,222,128,0.15)',
  locked: '#3A3A4A',
};

// The 6 Gauges - Core System Explanation (THE REAL JUICE)
const GAUGE_SYSTEM = {
  intro: "You are not broken. You are a system. And now you have a dashboard.",
  philosophy: "Most self-help treats you like a problem to fix. InGauge treats you like a machine to understand. These 6 gauges are your operating system — check them regularly, and you'll finally know what's actually going on inside.",
  gauges: [
    {
      id: 'body',
      emoji: '🫀',
      name: 'Body',
      color: '#F87171',
      tagline: 'The hardware running everything',
      description: "Your body isn't separate from your mind — it IS your mind's infrastructure. Every thought you think, every emotion you feel, runs on physical hardware: neurons that need glucose, neurotransmitters that need amino acids from protein, a prefrontal cortex that goes offline without sleep. When people say 'it's all in your head,' they're accidentally right — your head runs on a body.",
      sections: [
        {
          title: "Why Body Comes First",
          content: "You cannot think clearly when dehydrated — your brain is 75% water. You cannot regulate emotions on 4 hours of sleep — your amygdala becomes 60% more reactive. You cannot make good decisions with low blood sugar — your prefrontal cortex literally loses power. This isn't weakness. This is physics. The most sophisticated emotional intelligence in the world won't help if the hardware is failing."
        },
        {
          title: "The Big 5 Body Inputs",
          content: "Sleep: 7-9 hours for adults. Less than 6 hours = cognitive impairment equivalent to being legally drunk. Your brain consolidates emotional memories during REM — skip it and yesterday's stress carries into today.\n\nFood: Your brain burns 20% of your calories. Low blood sugar mimics anxiety symptoms identically — racing heart, sweaty palms, dread. Eat protein with every meal; it stabilizes glucose.\n\nWater: 1-2% dehydration impairs cognition and mood. By the time you feel thirsty, you're already there. Most people walk around chronically dehydrated.\n\nMovement: Exercise releases BDNF — fertilizer for your brain. A 20-minute walk changes your neurochemistry. Sitting for 8+ hours increases anxiety and depression risk.\n\nHormones: Cortisol, estrogen, testosterone, thyroid — these invisible chemicals shape your mood more than your circumstances do. Menstrual cycles, stress responses, and aging all shift the chemical soup you're swimming in."
        },
        {
          title: "The Body-Emotion Loop",
          content: "Here's what most people miss: emotions aren't just mental — they're physical events. Anxiety is a racing heart, shallow breathing, and muscle tension. Sadness is heaviness, low energy, and slowed movement. You can't separate the feeling from the body sensation. This is why body-based interventions (breathing, movement, cold water) work when 'thinking positive' fails. You're not going around the emotion — you're addressing it at the source."
        }
      ],
      whenLow: "Before diagnosing yourself with depression or anxiety, check: When did you last eat something with protein? How much water today? How many hours of sleep last night? When did you last move your body for 20+ minutes? Your 'emotional problem' might be a blood sugar problem wearing an emotional costume.",
      realWorld: [
        "A mother snaps at her kids every evening at 5pm. She thinks she has an anger problem. She actually has a blood sugar problem — she hasn't eaten since noon. A snack at 3:30pm changes her entire evening.",
        "A college student can't focus or regulate emotions on Sunday nights. It's not just Monday dread — his weekend sleep schedule (up until 3am) has disrupted his circadian rhythm. Fix the sleep, fix the scaries.",
        "Someone feels 'randomly anxious' every afternoon. When they track it, it correlates perfectly with skipping lunch. The anxiety wasn't random — it was hunger in disguise."
      ],
      science: "Sleep deprivation amplifies amygdala reactivity by 60% (Walker, 2017). Dehydration of just 1-2% impairs cognitive function and elevates anxiety (Biopsychology, Pinel). The gut produces 95% of the body's serotonin — digestive health directly impacts mood (gut-brain axis research). Exercise increases BDNF, promoting neuroplasticity and reducing depression symptoms as effectively as medication in some studies.",
    },
    {
      id: 'state',
      emoji: '⚡',
      name: 'State',
      color: '#FACC15',
      tagline: 'Your nervous system right now',
      description: "Your autonomic nervous system has three modes, not two. Fight-or-flight (sympathetic activation) is the gas pedal — heart racing, muscles tense, ready for action. Rest-and-digest (parasympathetic) is the brake — calm, present, able to think. But there's a third: freeze/shutdown (dorsal vagal) — when the system gets SO overwhelmed it just... stops. Numbness, disconnection, can't move. That's not laziness. That's your oldest survival system.",
      sections: [
        {
          title: "The Three States",
          content: "Sympathetic (Fight/Flight): Pupils dilate, heart races, blood flows to muscles, digestion stops, thinking narrows to threat. Good for escaping danger. Terrible for having a nuanced conversation or making complex decisions. When you're here, everything looks like a threat.\n\nParasympathetic (Rest/Digest): Heart slows, muscles relax, digestion works, prefrontal cortex comes online. This is where you can think clearly, connect with others, and make good choices. This is where you want to be for most of life.\n\nDorsal Vagal (Freeze/Shutdown): When threat is overwhelming and you can't fight or flee, the system shuts down. Numbness, dissociation, collapse, 'playing dead.' This isn't a choice — it's an ancient mammalian response. Depression often has freeze-state components."
        },
        {
          title: "Why State Changes Everything",
          content: "Here's the key insight: your nervous system state determines how you perceive reality. The same comment from your partner feels like helpful feedback when you're regulated and like a vicious attack when you're activated. You're not being dramatic — your threat-detection system is running hot, so it finds threats.\n\nThis is why arguments escalate. Person A says something slightly edgy. Person B, already activated, perceives it as an attack and responds defensively. Person A, now activated by the defensive response, escalates. Neither person is 'wrong' — both nervous systems are in threat mode, co-creating conflict."
        },
        {
          title: "You Can't Think Your Way Out",
          content: "Your autonomic nervous system runs faster than thought. By the time you're aware you're upset, your body has already flooded with cortisol and adrenaline. That's why 'just calm down' and 'be rational' don't work — you're asking the thinking brain to override a system that's been online for millions of years.\n\nThe only way out is through the body. Slow exhales activate the parasympathetic system (the vagus nerve responds to breathing patterns). Cold water on the face triggers the dive reflex. Movement discharges the activation energy. Presence of a calm person regulates you through co-regulation."
        }
      ],
      whenLow: "If you're activated (anxious, angry, reactive): Box breathing — 4 counts in, 4 hold, 4 out, 4 hold. Repeat 4+ times. Cold water on face. Walk around the block. Don't try to 'think through' the issue until your body calms first.\n\nIf you're in freeze (numb, can't move, dissociated): Gentle movement. Shake your hands. Push against a wall. Hum or sing (activates vagus nerve). Don't force yourself to 'snap out of it' — invite your system back slowly.",
      realWorld: [
        "A person in an argument says something they regret. In the moment, their amygdala was running the show. After 90 seconds and some deep breaths, the prefrontal cortex could have chosen a different response. They're not 'bad' — their nervous system was in survival mode.",
        "Someone who 'can't get off the couch' isn't lazy — they're in freeze. Telling them to 'just do it' increases shame without addressing the nervous system state. Gentle activation (stretching, music) works better than willpower.",
        "A parent yells at their kids when stressed. They know they shouldn't. But in that moment, their window of tolerance closed and their survival brain took over. Expanding that window requires nervous system training, not just good intentions."
      ],
      science: "Polyvagal Theory (Stephen Porges) identifies three branches of the autonomic nervous system and how they shape perception and behavior. The amygdala can trigger a threat response in 12 milliseconds — before conscious awareness. Co-regulation is documented: a calm person's presence measurably affects another's heart rate variability. The vagus nerve, activated by slow exhales, is the body's primary brake on stress response.",
    },
    {
      id: 'emotion',
      emoji: '💜',
      name: 'Emotion',
      color: '#A78BFA',
      tagline: 'What you\'re actually feeling',
      description: "Emotions are data, not directives. They're your brain's assessment of how things are going relative to your goals and needs. Fear says 'threat detected.' Anger says 'boundary violated.' Sadness says 'loss registered.' They're not good or bad — they're information. The problem isn't having emotions; it's not knowing what they're telling you.",
      sections: [
        {
          title: "More Than Happy, Sad, Mad",
          content: "Research identifies at least 27 distinct emotions — not just the 5-7 most people use. The difference between 'frustrated' and 'disappointed' matters. The difference between 'anxious' and 'excited' matters (they feel nearly identical in the body). The difference between 'sad' and 'lonely' determines what you need.\n\nThis is called emotional granularity, and it predicts mental health outcomes better than almost any other single factor. People who can precisely name what they feel regulate better, have fewer depression symptoms, and recover from setbacks faster. It's not about being 'emotional' — it's about being emotionally literate."
        },
        {
          title: "Primary vs. Secondary Emotions",
          content: "Anger is almost never the primary emotion. It's the bodyguard — it shows up to protect something more vulnerable underneath. Under anger, you'll usually find hurt (they didn't care about my feelings), fear (I might lose this relationship), or powerlessness (I can't control this situation).\n\nAnxiety often masks grief, excitement, or unprocessed old fear. 'Laziness' often masks overwhelm, depression, or freeze state. 'Fine' almost always masks something else entirely.\n\nThe therapeutic question is always: 'What's underneath this?' Keep asking until you hit something that resonates."
        },
        {
          title: "Emotions Are Physical Events",
          content: "Every emotion has a body signature. Anxiety: tight chest, shallow breathing, racing heart. Sadness: heaviness, low energy, throat tightness. Shame: heat in face, desire to curl inward, can't make eye contact. Joy: expansion, lightness, upward energy.\n\nThis is why you can't 'think' your way out of an emotion — it's not just in your head. It's in your body. And it's why body-based approaches (feeling into the sensation, breathing into the tightness) often work when cognitive approaches fail."
        },
        {
          title: "Name It to Tame It",
          content: "Brain imaging shows that simply naming an emotion (affect labeling) reduces amygdala activation. Putting words to feelings moves processing from the emotional brain to the prefrontal cortex. You're not wallowing — you're literally helping your brain process.\n\nBut the label has to be accurate. Calling everything 'stressed' doesn't help. Saying 'I'm anxious about the presentation, disappointed in myself for procrastinating, and honestly a little excited underneath' — that gives your brain specific information to work with."
        }
      ],
      whenLow: "Pause and actually name what you feel — precisely. Use an emotion wheel if needed. Ask: what's underneath this? What does this emotion need? Sometimes it needs expression (talk, write, move). Sometimes it needs action. Sometimes it just needs to be witnessed. Don't try to fix it until you've understood it.",
      realWorld: [
        "A person who always says 'I'm fine' when they're not is often suppressing — which research shows increases internal stress and cortisol. The brave face doesn't help; it costs more. When they finally name the feeling (overwhelmed, lonely, scared), it becomes manageable.",
        "A manager snaps at his team every Monday morning. He thinks he has an anger problem. Underneath: dread of the week ahead and fear of underperforming. Once he names the fear, the anger loses its grip.",
        "Someone feels 'anxious' before every date. When they get granular: nervous about rejection, excited about possibility, and worried they'll be boring. Three different feelings, three different needs, three different responses."
      ],
      science: "Emotional granularity predicts mental health outcomes (Lisa Feldman Barrett). Affect labeling reduces amygdala activation in brain imaging studies (Lieberman et al.). Suppression of emotions increases sympathetic nervous system activation and impairs memory. There are documented physiological signatures for distinct emotions across cultures (Ekman, Levenson).",
    },
    {
      id: 'connection',
      emoji: '🤝',
      name: 'Connection',
      color: '#4ADE80',
      tagline: 'Your relationship to others',
      description: "Humans are not solo creatures who sometimes socialize. We're social creatures who sometimes need solitude. Our nervous systems were designed to be regulated by other nervous systems. Loneliness isn't just emotionally painful — your brain processes it in the same regions as physical pain. Connection isn't a nice-to-have. It's a biological requirement.",
      sections: [
        {
          title: "Wired for Connection",
          content: "Babies who are fed but not held fail to thrive and can literally die — a phenomenon called 'failure to thrive.' Adults who are socially isolated have mortality risks comparable to smoking 15 cigarettes a day. Your immune system weakens. Your blood pressure rises. Your cognitive function declines.\n\nThis isn't because connection feels nice. It's because your body treats isolation as a threat state. Evolutionarily, a human alone was a human about to die. Your biology still operates on that assumption."
        },
        {
          title: "Quality Over Quantity",
          content: "It's not about having lots of friends. It's about having relationships where you feel seen, safe, and able to be yourself. One deep friendship beats 50 surface-level connections. One conversation where you feel truly heard beats a month of small talk.\n\nThe key variable is whether you can be authentic. If you have to perform, mask, or manage impression constantly, the connection doesn't 'count' neurologically. Your nervous system knows the difference between real and performed connection."
        },
        {
          title: "Co-Regulation Is Real",
          content: "When you're dysregulated and a calm person sits with you, your nervous system starts matching theirs. This isn't metaphor — heart rate variability actually synchronizes between people in close proximity. Babies learn to regulate through their caregiver's nervous system. Adults still benefit from this, though we forget.\n\nThis is why being around anxious people makes you anxious and being around calm people calms you down. It's why calling a friend when you're spiraling helps even if they don't say anything brilliant. Presence is medicine."
        },
        {
          title: "Attachment Patterns",
          content: "How you connected (or didn't) with early caregivers shapes how you connect now. Secure attachment: comfortable with intimacy and independence. Anxious attachment: fear of abandonment, need for reassurance. Avoidant attachment: discomfort with closeness, valuing independence to a fault. Disorganized: mixed signals, often from early trauma.\n\nThese aren't destiny. They're starting points. Understanding your pattern helps you work with it rather than being run by it."
        }
      ],
      whenLow: "Reach out to someone — and be real with them. Not a performative text. An actual conversation where you say how you're actually doing. If you don't have that person, consider: what pattern might be blocking connection? And start small — a genuine interaction with a barista counts more than a fake interaction with a 'friend.'",
      realWorld: [
        "A man has lots of friends and still feels lonely. He never lets any of them see him struggle. The quantity is there; the depth isn't. When he finally shares something vulnerable with one friend, the loneliness breaks.",
        "A woman feels anxious every evening. She lives alone and works from home. Her nervous system is spending 23 hours a day without co-regulation. She starts working from coffee shops occasionally. Anxiety decreases without 'treating' it directly.",
        "A teenager feels disconnected despite constant texting. There's contact but no connection. One real, face-to-face conversation with a friend changes how they feel more than 100 texts."
      ],
      science: "Social exclusion activates the dorsal anterior cingulate cortex — the same region involved in physical pain (Eisenberger et al.). Loneliness increases mortality risk by 26% (Holt-Lunstad meta-analysis). Heart rate variability synchronizes between people in close interaction (interpersonal physiology research). Secure attachment in adulthood is associated with better stress regulation, immune function, and relationship satisfaction (attachment theory research).",
    },
    {
      id: 'direction',
      emoji: '🧭',
      name: 'Direction',
      color: '#38BDF8',
      tagline: 'Purpose and momentum',
      description: "Direction isn't about having your whole life figured out. It's about having something to move toward — even if it's small, even if it changes. Humans are meaning-making creatures. Without purpose, even pleasure feels empty. With purpose, even hard work feels meaningful. The question isn't 'what's my passion?' It's 'what's one thing that matters enough to keep moving toward?'",
      sections: [
        {
          title: "The Dopamine of Progress",
          content: "Your brain releases dopamine not when you achieve a goal, but when you're making progress toward it. This is why the pursuit often feels better than the achievement. It's also why having nothing to pursue feels so bad — your dopamine system goes quiet.\n\nSmall wins matter more than big plans. Completing a small task releases dopamine. Making progress on something meaningful releases dopamine. This isn't about toxic productivity — it's about understanding that your brain needs something to move toward."
        },
        {
          title: "Meaning vs. Happiness",
          content: "Research distinguishes between hedonic wellbeing (pleasure, comfort) and eudaimonic wellbeing (meaning, purpose). They're both important, but they're not the same. You can have pleasure without meaning (empty enjoyment) and meaning without pleasure (hard but worthwhile work).\n\nPeople with high meaning and low happiness actually have better long-term outcomes than people with high happiness and low meaning. Meaning provides resilience. Comfort alone does not."
        },
        {
          title: "Lost, Not Lazy",
          content: "When direction is low, it looks like laziness, depression, or apathy. But often it's disorientation — not knowing what matters or which way to go. The solution isn't 'try harder.' It's 'get oriented.'\n\nYou don't need to find your capital-P Purpose. You need to find something — one thing — worth getting out of bed for. It can be small. It can change. But there needs to be something pulling you forward, or your psychology stagnates."
        },
        {
          title: "Values as Compass",
          content: "Direction comes from values — what matters to you independent of outcome. If you value creativity, you have direction when you're creating, regardless of external success. If you value connection, you have direction when you're building relationships.\n\nThe trap is living by someone else's values (parents, society, Instagram) and wondering why success feels empty. Direction has to be yours."
        }
      ],
      whenLow: "Ask: what's one small thing that would make today feel like it mattered? It doesn't have to be big or impressive. It just has to be real. Write it down. Do it. Direction comes from action, not from waiting for clarity. Clarity comes after you start moving.",
      realWorld: [
        "A person quits their high-paying job and feels lost. The paycheck was high but the meaning was low. They felt successful and empty at the same time. Finding work that aligned with their values paid less but filled the direction tank.",
        "A retiree becomes depressed after leaving work. It wasn't the work itself — it was having something to do each day. They start volunteering. The depression lifts. The structure and purpose were what mattered.",
        "A student can't motivate themselves to study. They're not lazy — they're not connected to why the degree matters. When they connect the coursework to something they actually care about, energy appears."
      ],
      science: "Dopamine is released during goal pursuit, not just achievement (reward prediction error research). Eudaimonic wellbeing (meaning) predicts health outcomes beyond hedonic wellbeing (pleasure) — including gene expression patterns (Fredrickson et al.). Having purpose in life is associated with reduced mortality risk, better sleep, and lower rates of Alzheimer's disease (longevity research).",
    },
    {
      id: 'alignment',
      emoji: '⚖️',
      name: 'Alignment',
      color: '#F472B6',
      tagline: 'Living your values',
      description: "Alignment is the match — or mismatch — between what you value and how you're living. When actions match values, there's integrity, coherence, peace. When they don't, there's friction — guilt, shame, anxiety, that nagging sense something's off. You don't have to be perfect. You have to be honest about the gap.",
      sections: [
        {
          title: "The Value-Action Gap",
          content: "Most people can articulate their values if asked: honesty, family, health, growth. But how we spend our time and energy often doesn't match. We value health but don't sleep. We value family but cancel on them for work. We value honesty but avoid hard conversations.\n\nThis gap isn't hypocrisy — it's the normal human condition. But the gap has costs. Your body registers it as stress, even if you don't consciously acknowledge it. That background unease is often misalignment showing up."
        },
        {
          title: "Integrity as Integration",
          content: "The word 'integrity' comes from 'integer' — whole, undivided. Alignment is integration: your inner values and outer actions pointing the same direction. When you're integrated, you don't have to manage separate versions of yourself. Energy isn't wasted on internal conflict.\n\nMisalignment is disintegration: pieces of you pulling different directions. Part of you wants to speak up; part suppresses. Part of you believes in honesty; part is maintaining a lie. This uses enormous psychological resources."
        },
        {
          title: "Boundaries as Alignment",
          content: "Boundaries aren't about keeping others out — they're about staying true to what matters. When you say yes to something you want to say no to, that's a values violation. When you tolerate treatment that conflicts with your self-respect, that's misalignment.\n\nEvery boundary is a statement about what you value. Setting them isn't selfish — it's aligning your external life with your internal compass."
        },
        {
          title: "The Discomfort Is Information",
          content: "When alignment is low, you feel it. Guilt says 'I acted against what I believe.' Shame says 'I am not who I want to be.' Resentment says 'I'm not honoring my needs.' These aren't just uncomfortable emotions — they're alignment signals.\n\nThe goal isn't to make these feelings disappear. It's to listen to what they're pointing at and take honest inventory. Sometimes the answer is changing behavior. Sometimes it's updating the value. But the first step is always acknowledging the gap."
        }
      ],
      whenLow: "Ask: Where am I saying one thing and doing another? What value am I betraying in how I'm living today? Sometimes it's small (I value rest but I'm doom-scrolling). Sometimes it's big (I value honesty but I'm hiding something). The alignment gauge doesn't expect perfection — it expects honesty. Name the gap. Then decide if you want to close it.",
      realWorld: [
        "A person feels constantly anxious but 'has no reason to be.' Turns out they're maintaining a version of themselves that isn't real — for their family, their job, their partner. The anxiety is the misalignment signal. When they start being more authentic, the anxiety decreases.",
        "Someone keeps agreeing to things they don't want to do, then feeling resentful. The resentment is the signal: their actions aren't matching their values around self-care. Learning to say no isn't selfish — it's alignment.",
        "A professional works at a company whose practices conflict with their ethics. They can't name why they're unhappy — good salary, decent hours. But the values mismatch creates constant low-grade dissonance. Leaving for an aligned role changes everything."
      ],
      science: "Cognitive dissonance (Festinger) describes the psychological tension of holding conflicting beliefs or acting against one's beliefs — and the mental effort required to resolve it. Self-determination theory identifies authenticity as a core psychological need. Value-action discrepancy is associated with increased cortisol and decreased wellbeing in longitudinal research. Moral injury — acting against deeply held values — is a predictor of PTSD beyond trauma exposure alone.",
    },
  ],
};

const TOOLKIT_ACTIVITIES = [
  { id: 'talk', emoji: '💬', title: 'Talk to Gauge', sub: 'Your AI companion' },
  { id: 'journal', emoji: '📓', title: 'Journal', sub: 'Write & reflect' },
  { id: 'breathing', emoji: '🫁', title: 'Breathing', sub: '2-min reset' },
  { id: 'emotion-wheel', emoji: '🎯', title: 'Emotion Decoder', sub: 'Name the feeling' },
  { id: 'body-scan', emoji: '🧍', title: 'Body Scan', sub: 'Map your stress' },
  { id: 'thought-challenger', emoji: '🧠', title: 'Thought Lab', sub: 'Test assumptions' },
  { id: 'emotion-match', emoji: '🎮', title: 'Pattern Match', sub: 'Find the source' },
  { id: 'trigger-map', emoji: '🗺️', title: 'Trigger Map', sub: 'Trace reactions' },
  { id: 'gratitude-jar', emoji: '✨', title: 'Gratitude', sub: 'Rewire your brain' },
  { id: 'stress-thermo', emoji: '🌡️', title: 'Stress Check', sub: 'Measure activation' },
  { id: 'comm-builder', emoji: '💬', title: 'Comm Lab', sub: 'Difficult talks' },
  { id: 'mood-patterns', emoji: '📊', title: 'Mood Intel', sub: 'Spot trends' },
];

// Flatten all lessons for card-based display
function getAllLessons(): { lesson: ManualLesson; section: ManualSection; moduleTitle: string }[] {
  const result: { lesson: ManualLesson; section: ManualSection; moduleTitle: string }[] = [];
  MANUAL_SECTIONS.forEach((section) => {
    section.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        result.push({ lesson, section, moduleTitle: module.title });
      });
    });
  });
  return result;
}

// Lesson Card Component - the core of the new design
function LessonCard({
  lesson,
  section,
  moduleTitle,
  isCompleted,
  isExpanded,
  onToggle,
  onOpenFull,
}: {
  lesson: ManualLesson;
  section: ManualSection;
  moduleTitle: string;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenFull: () => void;
}) {
  const intro = lesson.content.adult.introduction;
  const shortIntro = intro.length > 120 ? intro.slice(0, 120) + '...' : intro;

  return (
    <View style={[styles.lessonCard, isCompleted && styles.lessonCardCompleted]}>
      {/* Status indicator */}
      <View style={[styles.lessonStatus, isCompleted && styles.lessonStatusDone]}>
        {isCompleted ? (
          <Ionicons name="checkmark" size={14} color="#fff" />
        ) : (
          <View style={styles.lessonStatusLocked} />
        )}
      </View>

      <Pressable style={styles.lessonCardMain} onPress={onToggle}>
        {/* Big Emoji */}
        <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>

        {/* Title + Module tag */}
        <View style={styles.lessonCardHeader}>
          <Text style={styles.lessonCardCategory}>{moduleTitle}</Text>
          <Text style={styles.lessonCardTitle}>{lesson.title}</Text>
        </View>

        {/* One-liner preview */}
        {!isExpanded && (
          <Text style={styles.lessonCardPreview} numberOfLines={2}>
            {shortIntro}
          </Text>
        )}
      </Pressable>

      {/* Expanded content */}
      {isExpanded && (
        <View style={styles.lessonExpanded}>
          {/* Full introduction */}
          <Text style={styles.lessonExpandedIntro}>{intro}</Text>

          {/* Key Concepts */}
          {lesson.content.adult.keyConcepts.length > 0 && (
            <View style={styles.conceptsSection}>
              <Text style={styles.conceptsTitle}>Key Concepts</Text>
              {lesson.content.adult.keyConcepts.map((concept, i) => (
                <View key={i} style={styles.conceptItem}>
                  <Text style={styles.conceptName}>{concept.title}</Text>
                  <Text style={styles.conceptExplanation}>{concept.explanation}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Deep Dive preview */}
          {lesson.deepDive && (
            <View style={styles.deepDiveSection}>
              <Text style={styles.deepDiveTitle}>Deep Dive</Text>
              <Text style={styles.deepDiveText} numberOfLines={4}>
                {lesson.deepDive}
              </Text>
            </View>
          )}

          {/* Try This */}
          {lesson.tryThis && (
            <View style={styles.tryThisSection}>
              <Text style={styles.tryThisTitle}>✨ Try This</Text>
              <Text style={styles.tryThisText}>{lesson.tryThis}</Text>
            </View>
          )}

          {/* Action button */}
          <Pressable style={styles.lessonAction} onPress={onOpenFull}>
            <Text style={styles.lessonActionText}>Open Full Lesson</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
          </Pressable>
        </View>
      )}

      {/* Tap hint */}
      {!isExpanded && (
        <Pressable style={styles.tapHint} onPress={onToggle}>
          <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

// Discovery Card
function DiscoveryCard({
  discovery,
  showLearnMore,
  onToggleLearnMore,
  onDismiss,
}: {
  discovery: Discovery;
  showLearnMore: boolean;
  onToggleLearnMore: () => void;
  onDismiss: () => void;
}) {
  const translateX = useState(() => new Animated.Value(0))[0];

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
    onPanResponderMove: (_, g) => { if (g.dx < 0) translateX.setValue(g.dx); },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -80 || g.vx < -0.3) {
        Animated.timing(translateX, { toValue: -400, duration: 200, useNativeDriver: true }).start(onDismiss);
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 20 }).start();
      }
    },
  }), [translateX, onDismiss]);

  return (
    <Animated.View style={[styles.discoveryCard, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      <Pressable onPress={onToggleLearnMore}>
        <View style={styles.discoveryHeader}>
          <Text style={styles.discoveryEmoji}>{discovery.emoji}</Text>
          <Text style={styles.discoveryCategory}>{getCategoryTag(discovery.category)}</Text>
        </View>
        <Text style={styles.discoveryTitle}>{discovery.title}</Text>
        <Text style={styles.discoveryContent}>{discovery.content}</Text>

        {showLearnMore && discovery.expanded && (
          <View style={styles.discoveryExpandedWrap}>
            <Text style={styles.discoveryExpanded}>{discovery.expanded}</Text>
          </View>
        )}

        <Text style={styles.discoveryTap}>
          {showLearnMore ? 'Tap to collapse' : 'Tap to learn more'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isLessonCompleted = useEducationStore((s) => s.isLessonCompleted);

  // Get all lessons flattened
  const allLessonsData = useMemo(() => getAllLessons(), []);

  // Track which lesson card is expanded
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  // Track which section filter is active (null = all)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Gauge system state
  const [expandedGaugeId, setExpandedGaugeId] = useState<string | null>(null);

  const handleToggleGauge = useCallback((gaugeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGaugeId((prev) => (prev === gaugeId ? null : gaugeId));
  }, []);

  // Discovery state
  const initialDiscoveries = useMemo(() => getDiscoveriesForDay(), []);
  const [visibleDiscoveries, setVisibleDiscoveries] = useState<Discovery[]>(initialDiscoveries);
  const [learnMoreDiscoveryId, setLearnMoreDiscoveryId] = useState<string | null>(null);
  const shownDiscoveryIds = useMemo(() => new Set(visibleDiscoveries.map((d) => d.id)), [visibleDiscoveries]);

  // Filter lessons by section
  const filteredLessons = useMemo(() => {
    if (!activeSectionId) return allLessonsData;
    return allLessonsData.filter((l) => l.section.id === activeSectionId);
  }, [allLessonsData, activeSectionId]);

  // Progress
  const allManualIds = getAllManualLessonIds();
  const totalManualLessons = allManualIds.length;
  const completedManualCount = allManualIds.filter((id) => isLessonCompleted(id)).length;
  const progressPercent = totalManualLessons ? Math.round((completedManualCount / totalManualLessons) * 100) : 0;

  const handleToggleLesson = useCallback((lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedLessonId((prev) => (prev === lessonId ? null : lessonId));
  }, []);

  const handleOpenLesson = useCallback((lessonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/lesson/${lessonId}` as const);
  }, [router]);

  const handleShowMoreDiscoveries = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const more = getMoreDiscoveries(shownDiscoveryIds);
    if (more.length > 0) setVisibleDiscoveries((prev) => [...prev, ...more]);
  }, [shownDiscoveryIds]);

  const handleDismissDiscovery = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisibleDiscoveries((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const openActivity = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (id === 'talk') return router.push('/(tabs)/talk');
    if (id === 'journal') return router.push('/(modals)/new-journal');
    router.push(`/(modals)/activity?id=${id}`);
  }, [router]);

  return (
    <ErrorBoundary>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Learn</Text>
          <Text style={styles.heroSubtitle}>Your emotional intelligence journey</Text>
        </View>

        {/* Meet Your Gauges - THE CORE CONCEPT */}
        <View style={styles.gaugeSystemSection}>
          <View style={styles.gaugeSystemHeader}>
            <Text style={styles.gaugeSystemTitle}>Meet Your Gauges</Text>
            <Text style={styles.gaugeSystemTagline}>{GAUGE_SYSTEM.intro}</Text>
          </View>
          
          <Text style={styles.gaugeSystemPhilosophy}>{GAUGE_SYSTEM.philosophy}</Text>

          {/* 6 Gauge Cards */}
          {GAUGE_SYSTEM.gauges.map((gauge) => {
            const isExpanded = expandedGaugeId === gauge.id;
            return (
              <View key={gauge.id} style={styles.gaugeCard}>
                <Pressable
                  style={styles.gaugeCardTouchable}
                  onPress={() => handleToggleGauge(gauge.id)}
                >
                  <View style={styles.gaugeCardHeader}>
                    <View style={[styles.gaugeIconWrap, { backgroundColor: gauge.color + '20' }]}>
                      <Text style={styles.gaugeIcon}>{gauge.emoji}</Text>
                    </View>
                    <View style={styles.gaugeCardHeaderText}>
                      <Text style={[styles.gaugeName, { color: gauge.color }]}>{gauge.name}</Text>
                      <Text style={styles.gaugeTagline}>{gauge.tagline}</Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </View>

                  {!isExpanded && (
                    <Text style={styles.gaugePreview} numberOfLines={2}>{gauge.description}</Text>
                  )}
                </Pressable>

                {isExpanded && (
                  <View style={styles.gaugeCardExpanded}>
                    {/* Core description */}
                    <Text style={styles.gaugeDescription}>{gauge.description}</Text>
                    
                    {/* Deep dive sections */}
                    {gauge.sections?.map((section, idx) => (
                      <View key={idx} style={styles.gaugeSection}>
                        <Text style={styles.gaugeSectionTitle}>{section.title}</Text>
                        <Text style={styles.gaugeSectionContent}>{section.content}</Text>
                      </View>
                    ))}
                    
                    {/* When it's low - actionable advice */}
                    <View style={[styles.gaugeCallout, { backgroundColor: gauge.color + '15' }]}>
                      <Text style={[styles.gaugeCalloutTitle, { color: gauge.color }]}>⚡ When It's Low</Text>
                      <Text style={styles.gaugeCalloutText}>{gauge.whenLow}</Text>
                    </View>

                    {/* Real world examples */}
                    {gauge.realWorld && gauge.realWorld.length > 0 && (
                      <View style={styles.gaugeRealWorld}>
                        <Text style={styles.gaugeRealWorldTitle}>📍 Real World</Text>
                        {gauge.realWorld.map((example, idx) => (
                          <View key={idx} style={styles.gaugeExample}>
                            <Text style={styles.gaugeExampleText}>{example}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Science */}
                    <View style={styles.gaugeScienceBox}>
                      <Text style={styles.gaugeScienceTitle}>🧬 The Science</Text>
                      <Text style={styles.gaugeScienceText}>{gauge.science}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Progress Ring */}
        <View style={styles.progressSection}>
          <View style={styles.progressRing}>
            <Text style={styles.progressNumber}>{progressPercent}</Text>
            <Text style={styles.progressPercent}>%</Text>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Human Manual</Text>
            <Text style={styles.progressSubtitle}>
              {completedManualCount} of {totalManualLessons} lessons unlocked
            </Text>
          </View>
        </View>

        {/* Section Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          <Pressable
            style={[styles.filterPill, !activeSectionId && styles.filterPillActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveSectionId(null);
            }}
          >
            <Text style={[styles.filterPillText, !activeSectionId && styles.filterPillTextActive]}>
              All
            </Text>
          </Pressable>
          {MANUAL_SECTIONS.map((section) => (
            <Pressable
              key={section.id}
              style={[styles.filterPill, activeSectionId === section.id && styles.filterPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSectionId(section.id);
              }}
            >
              <Text style={styles.filterPillEmoji}>{section.emoji}</Text>
              <Text style={[styles.filterPillText, activeSectionId === section.id && styles.filterPillTextActive]}>
                {section.title}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Lesson Cards */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>
            {activeSectionId
              ? MANUAL_SECTIONS.find((s) => s.id === activeSectionId)?.title
              : 'All Lessons'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {filteredLessons.length} lessons • Tap to reveal
          </Text>

          {filteredLessons.map(({ lesson, section, moduleTitle }) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              section={section}
              moduleTitle={moduleTitle}
              isCompleted={isLessonCompleted(lesson.id)}
              isExpanded={expandedLessonId === lesson.id}
              onToggle={() => handleToggleLesson(lesson.id)}
              onOpenFull={() => handleOpenLesson(lesson.id)}
            />
          ))}
        </View>

        {/* Discovery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Discovery</Text>
              <Text style={styles.sectionSubtitle}>What nobody taught you in school</Text>
            </View>
            <Text style={styles.sectionIcon}>🔮</Text>
          </View>

          {visibleDiscoveries.map((d) => (
            <DiscoveryCard
              key={d.id}
              discovery={d}
              showLearnMore={learnMoreDiscoveryId === d.id}
              onToggleLearnMore={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setLearnMoreDiscoveryId((cur) => (cur === d.id ? null : d.id));
              }}
              onDismiss={() => handleDismissDiscovery(d.id)}
            />
          ))}

          <Pressable style={styles.showMoreBtn} onPress={handleShowMoreDiscoveries}>
            <Text style={styles.showMoreText}>Discover more</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.accent} />
          </Pressable>
        </View>

        {/* Toolkit Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Your Toolkit</Text>
              <Text style={styles.sectionSubtitle}>Practical tools for everyday life</Text>
            </View>
            <Text style={styles.sectionIcon}>🧰</Text>
          </View>

          <View style={styles.toolkitGrid}>
            {TOOLKIT_ACTIVITIES.map((tool) => (
              <Pressable
                key={tool.id}
                style={styles.toolkitItem}
                onPress={() => openActivity(tool.id)}
              >
                <Text style={styles.toolkitEmoji}>{tool.emoji}</Text>
                <Text style={styles.toolkitTitle}>{tool.title}</Text>
                <Text style={styles.toolkitSub}>{tool.sub}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: 20,
  },

  // Hero
  hero: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Gauge System Section
  gaugeSystemSection: {
    marginBottom: 32,
  },
  gaugeSystemHeader: {
    marginBottom: 16,
  },
  gaugeSystemTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  gaugeSystemTagline: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.accent,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  gaugeSystemPhilosophy: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 23,
    marginBottom: 20,
  },
  gaugeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  gaugeCardTouchable: {
    padding: 20,
  },
  gaugeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gaugeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeIcon: {
    fontSize: 28,
  },
  gaugeCardHeaderText: {
    flex: 1,
    marginLeft: 14,
  },
  gaugeName: {
    fontSize: 20,
    fontWeight: '700',
  },
  gaugeTagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  gaugePreview: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 12,
  },
  gaugeCardExpanded: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  gaugeDescription: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 20,
  },
  gaugeSection: {
    marginBottom: 20,
  },
  gaugeSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  gaugeSectionContent: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  gaugeCallout: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  gaugeCalloutTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  gaugeCalloutText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 23,
  },
  gaugeRealWorld: {
    marginBottom: 16,
  },
  gaugeRealWorldTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  gaugeExample: {
    backgroundColor: COLORS.cardElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  gaugeExampleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  gaugeScienceBox: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 16,
    padding: 16,
  },
  gaugeScienceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 8,
  },
  gaugeScienceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },

  // Progress Section
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  progressRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  progressNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.accent,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 4,
  },
  progressInfo: {
    marginLeft: 20,
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Filter Pills
  filterScroll: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: COLORS.accentSoft,
  },
  filterPillEmoji: {
    fontSize: 16,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.accent,
  },

  // Lessons Section
  lessonsSection: {
    marginBottom: 32,
  },

  // Lesson Card
  lessonCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  lessonCardCompleted: {
    borderWidth: 1,
    borderColor: COLORS.successSoft,
  },
  lessonStatus: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.locked,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lessonStatusDone: {
    backgroundColor: COLORS.success,
  },
  lessonStatusLocked: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  lessonCardMain: {
    padding: 20,
    paddingRight: 56,
  },
  lessonEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  lessonCardHeader: {
    marginBottom: 8,
  },
  lessonCardCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  lessonCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 26,
  },
  lessonCardPreview: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  tapHint: {
    alignItems: 'center',
    paddingBottom: 12,
  },

  // Expanded Lesson Content
  lessonExpanded: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  lessonExpandedIntro: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 23,
    marginBottom: 20,
  },
  conceptsSection: {
    marginBottom: 20,
  },
  conceptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  conceptItem: {
    backgroundColor: COLORS.cardElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  conceptName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  conceptExplanation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  deepDiveSection: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  deepDiveTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
  },
  deepDiveText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tryThisSection: {
    backgroundColor: COLORS.successSoft,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  tryThisTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 8,
  },
  tryThisText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  lessonAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentSoft,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  lessonActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Section Shared
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionIcon: {
    fontSize: 24,
  },

  // Discovery Cards
  discoveryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  discoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discoveryEmoji: {
    fontSize: 36,
  },
  discoveryCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discoveryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  discoveryContent: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  discoveryExpandedWrap: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  discoveryExpanded: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  discoveryTap: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '500',
    marginTop: 14,
  },

  // Show More
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Toolkit
  toolkitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolkitItem: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  toolkitEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  toolkitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  toolkitSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
