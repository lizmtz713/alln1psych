#!/usr/bin/env python3
"""Patch replay.tsx: Phase 2 two buttons, Phase 3 Decode, Phase 4 Coach, Phase 5 Check out."""
import re

path = "app/(modals)/replay.tsx"
with open(path, "r") as f:
    content = f.read()

# Replace Phase 2: single Next -> Yes / Let me clarify
content = content.replace(
    """              <Pressable style={styles.primaryBtn} onPress={onNextPhase2} disabled={isLoading}>
                <Text style={styles.primaryBtnText}>Next</Text>
              </Pressable>
            </>
          )}

          {phase === 3 && (""",
    """              <View style={styles.twoButtonRow}>
                <Pressable style={styles.secondaryBtn} onPress={onMirrorClarify} disabled={isLoading}>
                  <Text style={styles.secondaryBtnText}>Let me clarify</Text>
                </Pressable>
                <Pressable style={styles.primaryBtn} onPress={onMirrorYes} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryBtnText}>Yes, that's right</Text>}
                </Pressable>
              </View>
            </>
          )}

          {phase === 3 && (""",
)

# Replace Phase 3 body: Decode + What should I do?
content = content.replace(
    """          {phase === 3 && (
            <>
              <Text style={styles.phaseLabel}>What stands out to you?</Text>
              <TextInput
                style={[styles.largeInput, styles.reflectInput]}
                placeholder="One thing that still sits with you..."
                placeholderTextColor={TEXT_SECONDARY}
                value={reflectInput}
                onChangeText={setReflectInput}
                multiline
                minHeight={80}
              />
              <Pressable style={styles.primaryBtn} onPress={onNextPhase3} disabled={isLoading}>
                {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryBtnText}>Next</Text>}
              </Pressable>
            </>
          )}""",
    """          {phase === 3 && (
            <>
              <Text style={styles.phaseLabel}>Decode</Text>
              {isLoading ? (
                <View style={styles.responseCard}>
                  <ActivityIndicator size="small" color={ACCENT} />
                  <Text style={styles.loadingText}>Psych is decoding...</Text>
                </View>
              ) : (
                <View style={styles.responseCard}>
                  <Text style={styles.responseText}>{decodeResponse}</Text>
                </View>
              )}
              <Pressable style={styles.primaryBtn} onPress={onDecodeNext} disabled={isLoading}>
                {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryBtnText}>What should I do?</Text>}
              </Pressable>
            </>
          )}""",
)

# Replace Phase 4 body: Coach + Check in
content = content.replace(
    """          {phase === 4 && (
            <>
              <Text style={styles.phaseLabel}>Reframe</Text>
              {isLoading ? (
                <View style={styles.responseCard}>
                  <ActivityIndicator size="small" color={ACCENT} />
                </View>
              ) : (
                <View style={styles.responseCard}>
                  <Text style={styles.responseText}>{reframeResponse}</Text>
                </View>
              )}
              <Pressable style={styles.primaryBtn} onPress={onNextPhase4} disabled={isLoading}>
                <Text style={styles.primaryBtnText}>Next</Text>
              </Pressable>
            </>
          )}""",
    """          {phase === 4 && (
            <>
              <Text style={styles.phaseLabel}>Coach</Text>
              {isLoading ? (
                <View style={styles.responseCard}>
                  <ActivityIndicator size="small" color={ACCENT} />
                  <Text style={styles.loadingText}>Psych is coaching...</Text>
                </View>
              ) : (
                <View style={styles.responseCard}>
                  <Text style={styles.responseText}>{coachResponse}</Text>
                </View>
              )}
              <Pressable style={styles.primaryBtn} onPress={onCoachCheckIn} disabled={isLoading}>
                <Text style={styles.primaryBtnText}>Check in</Text>
              </Pressable>
            </>
          )}""",
)

# Replace Phase 5: Check out (clarity + connection) + Done
content = content.replace(
    """          {phase === 5 && (
            <>
              <Text style={styles.phaseLabel}>Takeaway</Text>
              {isLoading ? (
                <View style={styles.responseCard}>
                  <ActivityIndicator size="small" color={ACCENT} />
                </View>
              ) : (
                <View style={styles.responseCard}>
                  <Text style={styles.responseText}>{takeawayResponse}</Text>
                </View>
              )}
              {takeawayResponse ? (
                <Pressable style={styles.primaryBtn} onPress={onDone}>
                  <Text style={styles.primaryBtnText}>Done</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.primaryBtn} onPress={onGetTakeaway} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryBtnText}>Get takeaway</Text>}
                </Pressable>
              )}
            </>
          )}""",
    """          {phase === 5 && (
            <>
              <Text style={styles.phaseLabel}>Check out</Text>
              <Text style={styles.checkoutQuestion}>How clear do you feel about this now?</Text>
              <View style={styles.chipRow}>
                {(['much', 'somewhat', 'confused'] as const).map((key) => (
                  <Pressable key={key} style={[styles.chip, clarityChoice === key && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setClarityChoice(key); }}>
                    <Text style={[styles.chipText, clarityChoice === key && styles.chipTextSelected]}>{key === 'much' ? 'Much clearer' : key === 'somewhat' ? 'Somewhat' : 'Still confused'}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.checkoutQuestion}>Do you feel more connected or more isolated after processing this?</Text>
              <View style={styles.chipRow}>
                {(['connected', 'same', 'isolated'] as const).map((key) => (
                  <Pressable key={key} style={[styles.chip, connectionChoice === key && styles.chipSelected]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setConnectionChoice(key); }}>
                    <Text style={[styles.chipText, connectionChoice === key && styles.chipTextSelected]}>{key === 'connected' ? 'More connected' : key === 'same' ? 'Same' : 'More isolated'}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={styles.primaryBtn} onPress={onDone}>
                <Text style={styles.primaryBtnText}>Done</Text>
              </Pressable>
            </>
          )}""",
)

with open(path, "w") as f:
    f.write(content)
print("Patched phase 2-5 UI")