import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, touchTarget, type ThemeColors } from "../design/theme.ts";
import type { QuestionCategory } from "../types.ts";

export type CategoryFilter = "all" | QuestionCategory;

export type CategoryOption = {
  value: CategoryFilter;
  label: string;
  count: number;
};

type CategorySelectorProps = {
  colors: ThemeColors;
  onClose: () => void;
  onOpen: () => void;
  onSelect: (option: CategoryOption) => void;
  open: boolean;
  options: CategoryOption[];
  selectedCategoryCount: number;
  selectedCategoryLabel: string;
  selectedValue: CategoryFilter;
};

export function CategorySelector({
  colors,
  onClose,
  onOpen,
  onSelect,
  open,
  options,
  selectedCategoryCount,
  selectedCategoryLabel,
  selectedValue,
}: CategorySelectorProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [styles.categorySelectorTrigger, pressed && styles.categorySelectorTriggerPressed]}
      >
        <View style={styles.categorySelectorCopy}>
          <Text style={styles.categorySelectorLabel}>학습 범위</Text>
          <Text numberOfLines={1} style={styles.selectedCategoryLabel}>
            {selectedCategoryLabel}
          </Text>
        </View>
        <View style={styles.selectedCategoryCountPill}>
          <Text style={styles.selectedCategoryCount}>{selectedCategoryCount}문항</Text>
        </View>
      </Pressable>

      <Modal animationType="slide" onRequestClose={onClose} transparent visible={open}>
        <View style={styles.categorySelectorModal}>
          <Pressable
            accessibilityLabel="카테고리 선택 닫기"
            accessibilityRole="button"
            onPress={onClose}
            style={styles.categorySelectorBackdrop}
          />
          <View style={styles.categorySelectorSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>카테고리 선택</Text>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [styles.sheetCloseButton, pressed && styles.sheetCloseButtonPressed]}
              >
                <Text style={styles.sheetCloseText}>닫기</Text>
              </Pressable>
            </View>

            <View style={styles.categoryOptions}>
              {options.map((option) => {
                const active = option.value === selectedValue;

                return (
                  <Pressable
                    accessibilityRole="menuitem"
                    key={option.value}
                    onPress={() => onSelect(option)}
                    style={({ pressed }) => [
                      styles.categoryOption,
                      active && styles.activeCategoryOption,
                      pressed && styles.categoryOptionPressed,
                    ]}
                  >
                    <Text style={[styles.categoryOptionLabel, active && styles.activeCategoryOptionLabel]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.categoryOptionCount, active && styles.activeCategoryOptionCount]}>
                      {option.count}문항
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    categorySelectorTrigger: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.md,
      justifyContent: "center",
      minHeight: touchTarget.minHeight,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    categorySelectorTriggerPressed: {
      backgroundColor: colors.surfaceMuted,
    },
    categorySelectorCopy: {
      flex: 1,
      gap: spacing.xs,
      minWidth: 0,
    },
    categorySelectorLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
    },
    selectedCategoryLabel: {
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: "800",
    },
    selectedCategoryCountPill: {
      backgroundColor: colors.primarySoft,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    selectedCategoryCount: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "800",
    },
    categorySelectorModal: {
      flex: 1,
      justifyContent: "flex-end",
    },
    categorySelectorBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.backdrop,
    },
    categorySelectorSheet: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderTopLeftRadius: radius.md,
      borderTopRightRadius: radius.md,
      borderTopWidth: 1,
      gap: spacing.lg,
      paddingBottom: spacing.xxl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
    },
    sheetHandle: {
      alignSelf: "center",
      backgroundColor: colors.borderStrong,
      borderRadius: 2,
      height: 4,
      width: 36,
    },
    sheetHeader: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.md,
      justifyContent: "space-between",
    },
    sheetTitle: {
      color: colors.textPrimary,
      flex: 1,
      fontSize: 19,
      fontWeight: "800",
    },
    sheetCloseButton: {
      alignItems: "center",
      borderRadius: radius.md,
      justifyContent: "center",
      minHeight: touchTarget.minHeight,
      paddingHorizontal: spacing.lg,
    },
    sheetCloseButtonPressed: {
      backgroundColor: colors.surfaceMuted,
    },
    sheetCloseText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "800",
    },
    categoryOptions: {
      gap: spacing.sm,
    },
    categoryOption: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.md,
      justifyContent: "space-between",
      minHeight: touchTarget.minHeight,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    activeCategoryOption: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
    },
    categoryOptionPressed: {
      backgroundColor: colors.surfaceMuted,
    },
    categoryOptionLabel: {
      color: colors.textPrimary,
      flex: 1,
      fontSize: 16,
      fontWeight: "800",
    },
    activeCategoryOptionLabel: {
      color: colors.primary,
    },
    categoryOptionCount: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "700",
    },
    activeCategoryOptionCount: {
      color: colors.primary,
    },
  });
}
