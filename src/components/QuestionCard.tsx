import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, type ThemeColors } from "../design/theme.ts";
import type { ShortQuestion } from "../types.ts";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "../types.ts";

type QuestionCardProps = {
  colors: ThemeColors;
  question: ShortQuestion;
};

export function QuestionCard({ colors, question }: QuestionCardProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.questionPanel}>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{CATEGORY_LABELS[question.category]}</Text>
        <Text style={styles.metaText}>{DIFFICULTY_LABELS[question.difficulty]}</Text>
      </View>
      <Text style={styles.prompt}>{question.prompt}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    questionPanel: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      gap: spacing.md,
      padding: spacing.xl,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    metaText: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.sm,
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    prompt: {
      color: colors.textSecondary,
      fontSize: 17,
      lineHeight: 25,
    },
  });
}
