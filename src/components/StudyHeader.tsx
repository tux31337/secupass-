import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, type ThemeColors } from "../design/theme.ts";

type StudyHeaderProps = {
  colors: ThemeColors;
  currentIndex: number;
  totalCount: number;
};

export function StudyHeader({ colors, currentIndex, totalCount }: StudyHeaderProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        <Text style={styles.appTitle}>정보보안기사 단답</Text>
        <Text style={styles.subtitle}>짧게 풀고 바로 채점</Text>
      </View>
      <View style={styles.counterPill}>
        <Text style={styles.counter}>
          {currentIndex}/{totalCount}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.md,
      justifyContent: "space-between",
    },
    titleGroup: {
      flex: 1,
      gap: spacing.xs,
      minWidth: 0,
    },
    appTitle: {
      color: colors.textPrimary,
      flexShrink: 1,
      fontSize: 22,
      fontWeight: "800",
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    counterPill: {
      alignItems: "center",
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      justifyContent: "center",
      minHeight: 36,
      minWidth: 64,
      paddingHorizontal: spacing.md,
    },
    counter: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "800",
    },
  });
}
