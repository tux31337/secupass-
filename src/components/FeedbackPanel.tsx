import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, type ThemeColors } from "../design/theme.ts";
import type { GradeResult } from "../domain/grading.ts";

type FeedbackPanelProps = {
  colors: ThemeColors;
  explanation: string;
  result: GradeResult;
};

export function FeedbackPanel({ colors, explanation, result }: FeedbackPanelProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const feedbackStateStyle = result.isCorrect ? styles.correctFeedback : styles.wrongFeedback;
  const feedbackTitleStyle = result.isCorrect ? styles.correctFeedbackTitle : styles.wrongFeedbackTitle;

  return (
    <View style={[styles.feedback, feedbackStateStyle]}>
      <Text style={[styles.feedbackTitle, feedbackTitleStyle]}>{result.feedback}</Text>
      <Text style={styles.feedbackText}>정답: {result.expectedAnswer}</Text>
      <Text style={styles.feedbackText}>{explanation}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    feedback: {
      borderRadius: radius.md,
      borderWidth: 1,
      gap: spacing.sm,
      padding: spacing.lg,
    },
    correctFeedback: {
      backgroundColor: colors.successBackground,
      borderColor: colors.successBorder,
    },
    wrongFeedback: {
      backgroundColor: colors.errorBackground,
      borderColor: colors.errorBorder,
    },
    feedbackTitle: {
      fontSize: 17,
      fontWeight: "800",
    },
    correctFeedbackTitle: {
      color: colors.successText,
    },
    wrongFeedbackTitle: {
      color: colors.errorText,
    },
    feedbackText: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
  });
}
