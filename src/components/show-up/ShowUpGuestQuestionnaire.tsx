/**
 * Mobile-first guest flow: one question per screen (core) + optional deeper block.
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  CONTACT_METHOD_OPTIONS,
  CHECK_IN_OPTIONS,
  STRESS_HELP_OPTIONS,
  STRESS_AVOID_OPTIONS,
  APPRECIATION_OPTIONS,
  IMPORTANT_DATES_KIND,
  DEEPER_COMM_OPTIONS,
  DEEPER_REPAIR_OPTIONS,
  DEEPER_BARRIER_OPTIONS,
  DEEPER_FREQ_OPTIONS,
  DEEPER_INVITE_OPTIONS,
} from '../../data/showUpQuestionnaire';
import type { ShowUpAnswers } from '../../types/showUp';
import {
  rpcSubmitShowUpResponse,
  getShowUpPublicUrl,
  getGuestPassAlongShareMessage,
} from '../../services/showUpService';
import { COLORS, SPACING, BORDER_RADIUS } from '../../lib/constants';

type Step =
  | 'intro'
  | 'name'
  | 'contact'
  | 'contact_note'
  | 'checkin'
  | 'stress_help'
  | 'stress_avoid'
  | 'appreciation'
  | 'easy'
  | 'dates_kind'
  | 'dates_detail'
  | 'notes'
  | 'deeper_prompt'
  | 'deeper_all'
  | 'done';

const CARD = COLORS.surface;
const TEXT = COLORS.text;
const MUTED = COLORS.textSecondary;
const BORDER = COLORS.border;

function toggleInList(list: string[], id: string, max: number): string[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (list.length >= max) return list;
  return [...list, id];
}

export function ShowUpGuestQuestionnaire(props: {
  token: string;
  inviterName: string;
  alreadyCompleted: boolean;
}) {
  const { width } = useWindowDimensions();
  const maxW = Math.min(480, width - 32);

  const [step, setStep] = useState<Step>(props.alreadyCompleted ? 'done' : 'intro');
  const [answers, setAnswers] = useState<ShowUpAnswers>({});
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const go = useCallback((s: Step) => setStep(s), []);

  const buildPayload = useCallback((): ShowUpAnswers => {
    return {
      ...answers,
      consentPersonalization: consent,
    };
  }, [answers, consent]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    const name = answers.preferredName?.trim() || '';
    const res = await rpcSubmitShowUpResponse(props.token, buildPayload(), name, consent);
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.error === 'already_completed' ? 'This link was already used.' : res.error || 'Something went wrong.');
      return;
    }
    go('done');
  }, [props.token, answers.preferredName, buildPayload, consent, go]);

  const onNextFromNotes = useCallback(() => {
    go('deeper_prompt');
  }, [go]);

  const chipSelect = (
    label: string,
    selected: boolean,
    onPress: () => void,
    disabled?: boolean
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipOn,
        pressed && styles.chipPressed,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );

  const primaryBtn = (title: string, onPress: () => void, disabled?: boolean) => (
    <Pressable
      style={({ pressed }) => [styles.primaryBtn, (disabled || pressed) && { opacity: 0.85 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.primaryBtnText}>{title}</Text>
    </Pressable>
  );

  const secondaryBtn = (title: string, onPress: () => void) => (
    <Pressable style={styles.secondaryBtn} onPress={onPress}>
      <Text style={styles.secondaryBtnText}>{title}</Text>
    </Pressable>
  );

  const header = useMemo(
    () => (
      <Text style={styles.privacy}>
        Your answers will only be visible to {props.inviterName} inside their InGauge app to help them show up for you
        better.
      </Text>
    ),
    [props.inviterName]
  );

  if (props.alreadyCompleted && step === 'done') {
    return (
      <ScrollView contentContainerStyle={[styles.scroll, { maxWidth: maxW, alignSelf: 'center' }]}>
        <Text style={styles.title}>Thanks — you already shared.</Text>
        <Text style={styles.sub}>
          If you want to update your answers, ask {props.inviterName} for a fresh link.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.scroll, { maxWidth: maxW, alignSelf: 'center', width: '100%' }]}
    >
      {step === 'intro' && (
        <>
          <Text style={styles.title}>Help me show up for you better</Text>
          <Text style={styles.valueLead}>This helps me know:</Text>
          <Text style={styles.valueBullet}>• how to support you when you&apos;re stressed</Text>
          <Text style={styles.valueBullet}>• how to communicate in a way that works for you</Text>
          <Text style={styles.valueBullet}>• what makes you feel remembered</Text>
          <Text style={[styles.microPreview, { marginTop: SPACING.md }]}>
            A few quick questions — then you&apos;re done. {props.inviterName} only sees what you choose to share.
          </Text>
          <Text style={[styles.sub, { marginTop: SPACING.lg }]}>This takes about 2 minutes.</Text>
          <Text style={styles.sub}>No app download needed.</Text>
          <Text style={styles.sub}>Only shared with {props.inviterName}.</Text>
          <Text style={styles.sub}>You can skip anything.</Text>
          {header}
          {primaryBtn('Start', () => go('name'))}
        </>
      )}

      {step === 'name' && (
        <>
          <Text style={styles.q}>What name do you like to go by?</Text>
          <Text style={styles.helper}>Nickname or pronunciation notes are welcome.</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={MUTED}
            value={answers.preferredName ?? ''}
            onChangeText={(t) => setAnswers((a) => ({ ...a, preferredName: t }))}
          />
          {primaryBtn('Next', () => go('contact'))}
          {secondaryBtn('Skip', () => go('contact'))}
        </>
      )}

      {step === 'contact' && (
        <>
          <Text style={styles.q}>What&apos;s usually the best way to reach you?</Text>
          <View style={styles.chipWrap}>
            {CONTACT_METHOD_OPTIONS.map((o) =>
              chipSelect(o.label, answers.contactMethod === o.id, () =>
                setAnswers((a) => ({ ...a, contactMethod: o.id }))
              )
            )}
          </View>
          {primaryBtn('Next', () => {
            if (answers.contactMethod === 'depends') go('contact_note');
            else go('checkin');
          })}
        </>
      )}

      {step === 'contact_note' && (
        <>
          <Text style={styles.q}>When does it depend? (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputTall]}
            placeholder="e.g. Text during the week, call on weekends"
            placeholderTextColor={MUTED}
            value={answers.contactDependsNote ?? ''}
            onChangeText={(t) => setAnswers((a) => ({ ...a, contactDependsNote: t }))}
            multiline
          />
          {primaryBtn('Next', () => go('checkin'))}
        </>
      )}

      {step === 'checkin' && (
        <>
          <Text style={styles.q}>What kind of check-ins feel good to you?</Text>
          <Text style={styles.helper}>Choose up to 2.</Text>
          <View style={styles.chipWrap}>
            {CHECK_IN_OPTIONS.map((o) =>
              chipSelect(
                o.label,
                (answers.checkInStyle ?? []).includes(o.id),
                () =>
                  setAnswers((a) => ({
                    ...a,
                    checkInStyle: toggleInList(a.checkInStyle ?? [], o.id, 2),
                  })),
                (answers.checkInStyle ?? []).length >= 2 && !(answers.checkInStyle ?? []).includes(o.id)
              )
            )}
          </View>
          {primaryBtn('Next', () => go('stress_help'))}
          {secondaryBtn('Skip', () => go('stress_help'))}
        </>
      )}

      {step === 'stress_help' && (
        <>
          <Text style={styles.q}>When you&apos;re stressed, what usually helps most?</Text>
          <Text style={styles.helper}>Choose up to 2.</Text>
          <View style={styles.chipWrap}>
            {STRESS_HELP_OPTIONS.map((o) =>
              chipSelect(
                o.label,
                (answers.stressSupport ?? []).includes(o.id),
                () =>
                  setAnswers((a) => ({
                    ...a,
                    stressSupport: toggleInList(a.stressSupport ?? [], o.id, 2),
                  })),
                (answers.stressSupport ?? []).length >= 2 && !(answers.stressSupport ?? []).includes(o.id)
              )
            )}
          </View>
          {primaryBtn('Next', () => go('stress_avoid'))}
          {secondaryBtn('Skip', () => go('stress_avoid'))}
        </>
      )}

      {step === 'stress_avoid' && (
        <>
          <Text style={styles.q}>What usually doesn&apos;t help when you&apos;re stressed?</Text>
          <Text style={styles.helper}>Choose any that apply.</Text>
          <View style={styles.chipWrap}>
            {STRESS_AVOID_OPTIONS.map((o) =>
              chipSelect(o.label, (answers.stressAvoid ?? []).includes(o.id), () =>
                setAnswers((a) => ({
                  ...a,
                  stressAvoid: (a.stressAvoid ?? []).includes(o.id)
                    ? (a.stressAvoid ?? []).filter((x) => x !== o.id)
                    : [...(a.stressAvoid ?? []), o.id],
                }))
              )
            )}
          </View>
          {primaryBtn('Next', () => go('appreciation'))}
          {secondaryBtn('Skip', () => go('appreciation'))}
        </>
      )}

      {step === 'appreciation' && (
        <>
          <Text style={styles.q}>What makes you feel remembered or appreciated?</Text>
          <Text style={styles.helper}>Choose up to 2.</Text>
          <View style={styles.chipWrap}>
            {APPRECIATION_OPTIONS.map((o) =>
              chipSelect(
                o.label,
                (answers.appreciation ?? []).includes(o.id),
                () =>
                  setAnswers((a) => ({
                    ...a,
                    appreciation: toggleInList(a.appreciation ?? [], o.id, 2),
                  })),
                (answers.appreciation ?? []).length >= 2 && !(answers.appreciation ?? []).includes(o.id)
              )
            )}
          </View>
          {primaryBtn('Next', () => go('easy'))}
          {secondaryBtn('Skip', () => go('easy'))}
        </>
      )}

      {step === 'easy' && (
        <>
          <Text style={styles.q}>What&apos;s one easy way someone can show up for you?</Text>
          <TextInput
            style={[styles.input, styles.inputTall]}
            placeholder='e.g. Ask me how I am really doing'
            placeholderTextColor={MUTED}
            value={answers.easyShowUp ?? ''}
            onChangeText={(t) => setAnswers((a) => ({ ...a, easyShowUp: t }))}
            multiline
          />
          {primaryBtn('Next', () => go('dates_kind'))}
          {secondaryBtn('Skip', () => go('dates_kind'))}
        </>
      )}

      {step === 'dates_kind' && (
        <>
          <Text style={styles.q}>Any important dates or seasons you want people close to you to remember?</Text>
          <View style={styles.chipWrap}>
            {IMPORTANT_DATES_KIND.map((o) =>
              chipSelect(o.label, answers.importantDatesKind === o.id, () =>
                setAnswers((a) => ({ ...a, importantDatesKind: o.id }))
              )
            )}
          </View>
          {primaryBtn('Next', () => {
            if (answers.importantDatesKind && answers.importantDatesKind !== 'not_now') go('dates_detail');
            else go('notes');
          })}
        </>
      )}

      {step === 'dates_detail' && (
        <>
          <Text style={styles.q}>Add a note or date (optional)</Text>
          <TextInput
            style={[styles.input, styles.inputTall]}
            placeholder="Month, date, or a few words"
            placeholderTextColor={MUTED}
            value={answers.importantDatesDetail ?? ''}
            onChangeText={(t) => setAnswers((a) => ({ ...a, importantDatesDetail: t }))}
            multiline
          />
          {primaryBtn('Next', () => go('notes'))}
        </>
      )}

      {step === 'notes' && (
        <>
          <Text style={styles.q}>Anything else you want me to know so I can show up better for you?</Text>
          <TextInput
            style={[styles.input, styles.inputTall]}
            placeholder="Optional"
            placeholderTextColor={MUTED}
            value={answers.additionalNotes ?? ''}
            onChangeText={(t) => setAnswers((a) => ({ ...a, additionalNotes: t.slice(0, 300) }))}
            multiline
            maxLength={300}
          />
          <Pressable
            style={styles.consentRow}
            onPress={() => setConsent((c) => !c)}
          >
            <Text style={styles.consentBox}>{consent ? '☑' : '☐'}</Text>
            <Text style={styles.consentText}>
              I&apos;m okay with my answers being used to personalize reminders and support suggestions for{' '}
              {props.inviterName}.
            </Text>
          </Pressable>
          {primaryBtn('Continue', onNextFromNotes)}
        </>
      )}

      {step === 'deeper_prompt' && (
        <>
          <Text style={styles.title}>Want to answer a few more?</Text>
          <Text style={styles.sub}>This helps me understand your communication and repair style better.</Text>
          {primaryBtn('Yes, a few more', () => go('deeper_all'))}
          {secondaryBtn('Skip', () => submit())}
          {submitting && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 16 }} />}
          {submitError ? <Text style={styles.err}>{submitError}</Text> : null}
        </>
      )}

      {step === 'deeper_all' && (
        <>
          <Text style={styles.q}>Which communication style feels best to you?</Text>
          <View style={styles.chipWrap}>
            {DEEPER_COMM_OPTIONS.map((o) =>
              chipSelect(o.label, answers.communicationStyle === o.id, () =>
                setAnswers((a) => ({ ...a, communicationStyle: o.id }))
              )
            )}
          </View>
          <Text style={[styles.q, { marginTop: SPACING.lg }]}>If we ever have tension, what helps most?</Text>
          <View style={styles.chipWrap}>
            {DEEPER_REPAIR_OPTIONS.map((o) =>
              chipSelect(o.label, answers.repairPreference === o.id, () =>
                setAnswers((a) => ({ ...a, repairPreference: o.id }))
              )
            )}
          </View>
          <Text style={[styles.q, { marginTop: SPACING.lg }]}>What makes conflict or repair harder for you?</Text>
          <View style={styles.chipWrap}>
            {DEEPER_BARRIER_OPTIONS.map((o) =>
              chipSelect(o.label, (answers.repairBarriers ?? []).includes(o.id), () =>
                setAnswers((a) => ({
                  ...a,
                  repairBarriers: (a.repairBarriers ?? []).includes(o.id)
                    ? (a.repairBarriers ?? []).filter((x) => x !== o.id)
                    : [...(a.repairBarriers ?? []), o.id],
                }))
              )
            )}
          </View>
          <Text style={[styles.q, { marginTop: SPACING.lg }]}>How often do you like hearing from close people?</Text>
          <View style={styles.chipWrap}>
            {DEEPER_FREQ_OPTIONS.map((o) =>
              chipSelect(o.label, answers.contactFrequency === o.id, () =>
                setAnswers((a) => ({ ...a, contactFrequency: o.id }))
              )
            )}
          </View>
          <Text style={[styles.q, { marginTop: SPACING.lg }]}>What kinds of plans feel best to you?</Text>
          <View style={styles.chipWrap}>
            {DEEPER_INVITE_OPTIONS.map((o) =>
              chipSelect(o.label, (answers.invitationStyle ?? []).includes(o.id), () =>
                setAnswers((a) => ({
                  ...a,
                  invitationStyle: (a.invitationStyle ?? []).includes(o.id)
                    ? (a.invitationStyle ?? []).filter((x) => x !== o.id)
                    : [...(a.invitationStyle ?? []), o.id],
                }))
              )
            )}
          </View>
          {primaryBtn(submitting ? 'Sending…' : 'Submit', () => submit(), submitting)}
          {submitError ? <Text style={styles.err}>{submitError}</Text> : null}
        </>
      )}

      {step === 'done' && (
        <>
          <Text style={styles.title}>You just made it easier for someone to show up for you.</Text>
          <Text style={styles.subEmphasis}>Most people never know how to do that.</Text>
          <Text style={[styles.sub, { marginTop: SPACING.md }]}>
            That&apos;s thoughtful — and it helps {props.inviterName} care for you in a way that actually fits.
          </Text>

          <View style={styles.reciprocityBox}>
            <Text style={styles.reciprocityTitle}>A two-way street</Text>
            <Text style={styles.reciprocityBody}>
              They&apos;ll know how to show up for you. Want to know how to show up for them too? Even a simple
              conversation can open that door — no form required.
            </Text>
          </View>

          <Text style={styles.growthSectionLabel}>Share the idea (optional)</Text>
          <Text style={[styles.growthLead, { marginTop: 6 }]}>Want to send this to someone you care about too?</Text>
          <Text style={styles.helper}>
            The button below copies a short message plus a link to InGauge — not your private answers link. Pass it along
            if it feels right — never required.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.9 }]}
            onPress={async () => {
              await Clipboard.setStringAsync(getGuestPassAlongShareMessage());
            }}
          >
            <Text style={styles.outlineBtnText}>Copy invite message</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
            onPress={async () => {
              try {
                await Share.share({ message: getGuestPassAlongShareMessage() });
              } catch {
                /* user dismissed */
              }
            }}
          >
            <Text style={styles.primaryBtnText}>Send to a friend</Text>
          </Pressable>
          {secondaryBtn('Not now', () => {})}

          <View style={styles.doneDivider} />
          <Text style={styles.subtleHeading}>Your private link</Text>
          <Text style={styles.sub}>
            Only for you — it updates your answers for {props.inviterName}. Don&apos;t post this one in a group chat or
            social feed. You can change your answers anytime; save it somewhere only you can access.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.tertiaryBtn, pressed && { opacity: 0.85 }]}
            onPress={async () => {
              await Clipboard.setStringAsync(getShowUpPublicUrl(props.token));
            }}
          >
            <Text style={styles.tertiaryBtnText}>Copy my private update link</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: SPACING.lg, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: TEXT, marginBottom: SPACING.md },
  valueLead: { fontSize: 16, fontWeight: '600', color: TEXT, marginBottom: 10, marginTop: 4 },
  valueBullet: { fontSize: 16, color: TEXT, lineHeight: 24, marginBottom: 6, paddingLeft: 2 },
  sub: { fontSize: 16, color: MUTED, marginBottom: 6, lineHeight: 22 },
  subEmphasis: { fontSize: 17, fontWeight: '600', color: TEXT, marginBottom: 8, lineHeight: 24 },
  microPreview: { fontSize: 14, color: MUTED, lineHeight: 20, fontStyle: 'italic' },
  reciprocityBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.accentBg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '44',
  },
  reciprocityTitle: { fontSize: 14, fontWeight: '700', color: COLORS.accent, marginBottom: 8 },
  reciprocityBody: { fontSize: 15, color: TEXT, lineHeight: 22 },
  growthSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
    marginTop: SPACING.lg,
    letterSpacing: 0.3,
  },
  growthLead: { fontSize: 17, fontWeight: '600', color: TEXT },
  outlineBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
  },
  outlineBtnText: { fontSize: 17, fontWeight: '600', color: COLORS.accent },
  doneDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: SPACING.xl,
  },
  subtleHeading: { fontSize: 14, fontWeight: '600', color: TEXT, marginBottom: 8 },
  tertiaryBtn: { paddingVertical: 12, alignItems: 'center', marginTop: SPACING.sm },
  tertiaryBtnText: { fontSize: 15, color: COLORS.accent, fontWeight: '500' },
  privacy: { fontSize: 13, color: MUTED, marginTop: SPACING.lg, marginBottom: SPACING.lg, lineHeight: 18 },
  q: { fontSize: 18, fontWeight: '600', color: TEXT, marginBottom: SPACING.sm },
  helper: { fontSize: 14, color: MUTED, marginBottom: SPACING.md },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    fontSize: 16,
    color: TEXT,
    marginBottom: SPACING.lg,
  },
  inputTall: { minHeight: 88, textAlignVertical: 'top' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.lg },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  chipOn: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  chipPressed: { opacity: 0.9 },
  chipText: { fontSize: 15, color: TEXT },
  chipTextOn: { color: COLORS.accent, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center', marginTop: SPACING.sm },
  secondaryBtnText: { fontSize: 16, color: COLORS.accent },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: SPACING.lg },
  consentBox: { fontSize: 20, color: TEXT },
  consentText: { flex: 1, fontSize: 14, color: MUTED, lineHeight: 20 },
  err: { color: COLORS.error, marginTop: SPACING.md },
});
