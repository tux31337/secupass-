import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { radius, spacing, touchTarget, type ThemeColors } from "../design/theme.ts";

const androidNavigationBarInset = spacing.xxl;

type AnswerDockProps = {
  answer: string;
  colors: ThemeColors;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  onSubmit: () => void;
};

export function AnswerDock({ answer, colors, onAnswerChange, onNext, onSubmit }: AnswerDockProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.answerDock}>
      <TextInput
        value={answer}
        onChangeText={onAnswerChange}
        placeholder="답안 입력"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={styles.input}
        onSubmitEditing={onSubmit}
      />

      <View style={styles.actions}>
        <Pressable style={({ pressed }) => [styles.actionButton, styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={onSubmit}>
          <Text style={styles.primaryButtonText}>채점</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          onPress={onNext}
        >
          <Text style={styles.secondaryButtonText}>다음</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    input: {
      backgroundColor: colors.surface,
      borderColor: colors.borderStrong,
      borderRadius: radius.md,
      borderWidth: 1,
      color: colors.textPrimary,
      fontSize: 18,
      minHeight: 52,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    actions: {
      flexDirection: "row",
      gap: spacing.md,
    },
    answerDock: {
      backgroundColor: colors.surfaceContainer,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      gap: spacing.md,
      paddingBottom: Platform.OS === "android" ? spacing.lg + androidNavigationBarInset : spacing.lg,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
    },
    actionButton: {
      alignItems: "center",
      borderRadius: radius.md,
      flex: 1,
      justifyContent: "center",
      minHeight: touchTarget.minHeight,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    primaryButtonPressed: {
      backgroundColor: colors.primaryPressed,
    },
    secondaryButton: {
      backgroundColor: colors.surface,
      borderColor: colors.borderStrong,
      borderWidth: 1,
    },
    secondaryButtonPressed: {
      backgroundColor: colors.surfaceMuted,
    },
    primaryButtonText: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "800",
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "800",
    },
  });
}
