import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { questionBank } from "./src/data/questions.ts";
import { colors, radius, spacing, touchTarget } from "./src/design/theme.ts";
import { gradeShortAnswer, type GradeResult } from "./src/domain/grading.ts";
import { RangeScreen } from "./src/range/RangeScreen.tsx";
import {
  CATEGORY_LABELS,
  QUESTION_CATEGORIES,
  type QuestionCategory,
} from "./src/types.ts";

type CategoryFilter = "all" | QuestionCategory;
type CategoryOption = {
  value: CategoryFilter;
  label: string;
  count: number;
};

const keyboardAvoidingBehavior = Platform.select({
  ios: "padding" as const,
  android: "height" as const,
  default: undefined,
});
const compactScreenGap = spacing.md;
const compactQuestionPadding = spacing.lg;

export default function App() {
  const [screen, setScreen] = useState<"quiz" | "range">("quiz");

  return (
    <SafeAreaProvider>
      {screen === "range" ? (
        <RangeScreen onExit={() => setScreen("quiz")} />
      ) : (
        <LearningScreen onOpenRange={() => setScreen("range")} />
      )}
    </SafeAreaProvider>
  );
}

function LearningScreen({ onOpenRange }: { onOpenRange: () => void }) {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);
  const bottomSafeAreaInset = Math.max(insets.bottom, spacing.sm);
  const rootSafeAreaStyle = {
    paddingTop: insets.top,
  };
  const answerDockStyle = {
    paddingBottom: bottomSafeAreaInset + spacing.md,
  };
  const categorySelectorSheetStyle = {
    paddingBottom: bottomSafeAreaInset + spacing.lg,
  };

  const categoryOptions = useMemo<CategoryOption[]>(
    () => [
      { value: "all", label: "전체", count: questionBank.length },
      ...QUESTION_CATEGORIES.map((value) => ({
        value,
        label: CATEGORY_LABELS[value],
        count: questionBank.filter((question) => question.category === value).length,
      })),
    ],
    [],
  );

  const filteredQuestions = useMemo(
    () =>
      category === "all"
        ? questionBank
        : questionBank.filter((question) => question.category === category),
    [category],
  );

  const currentQuestion = filteredQuestions[questionIndex] ?? filteredQuestions[0];
  const selectedCategory = categoryOptions.find((option) => option.value === category) ?? categoryOptions[0];
  const selectedCategoryLabel = selectedCategory.label;
  const selectedCategoryCount = selectedCategory.count;
  const answerActionLabel = result ? "다음" : "채점";
  const answerActionHandler = result ? moveNext : submitAnswer;

  function selectCategory(nextCategory: CategoryFilter) {
    setCategory(nextCategory);
    setQuestionIndex(0);
    setAnswer("");
    setResult(null);
  }

  function submitAnswer() {
    setResult(gradeShortAnswer(currentQuestion, answer));
  }

  function updateAnswer(nextAnswer: string) {
    setAnswer(nextAnswer);
    setResult(null);
  }

  function moveNext() {
    setQuestionIndex((value) => (value + 1) % filteredQuestions.length);
    setAnswer("");
    setResult(null);
  }

  function selectCategoryOption(option: CategoryOption) {
    selectCategory(option.value);
    setCategorySelectorOpen(false);
  }

  return (
    <View style={[styles.safeArea, rootSafeAreaStyle]}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" translucent={false} />
      <KeyboardAvoidingView behavior={keyboardAvoidingBehavior} style={styles.keyboardAvoiding}>
        <View style={styles.layout}>
          <ScrollView
            style={styles.contentScroller}
            contentContainerStyle={styles.screen}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.appTitle}>정보보안기사 단답</Text>
              <View style={styles.headerActions}>
                <Pressable
                  accessibilityLabel="3D 드라이빙레인지 열기"
                  accessibilityRole="button"
                  onPress={onOpenRange}
                  style={({ pressed }) => [
                    styles.rangeButton,
                    pressed && styles.categorySelectorButtonPressed,
                  ]}
                >
                  <Text style={styles.rangeButtonText}>⛳ 레인지</Text>
                </Pressable>
                <Text style={styles.counter}>
                  {questionIndex + 1}/{filteredQuestions.length}
                </Text>
              </View>
            </View>

            <View style={styles.categorySelectorRow}>
              <View style={styles.categorySelectorInfo}>
                <Text style={styles.categorySelectorLabel}>학습 범위</Text>
                <View style={styles.categorySelectorSummary}>
                  <Text numberOfLines={1} style={styles.selectedCategoryLabel}>
                    {selectedCategoryLabel}
                  </Text>
                  <Text style={styles.selectedCategoryCount}>{selectedCategoryCount}문항</Text>
                </View>
              </View>
              <Pressable
                accessibilityLabel="학습 범위 변경"
                accessibilityRole="button"
                onPress={() => setCategorySelectorOpen(true)}
                style={({ pressed }) => [styles.categorySelectorButton, pressed && styles.categorySelectorButtonPressed]}
              >
                <Text style={styles.categorySelectorButtonText}>변경</Text>
              </Pressable>
            </View>

            <View style={styles.questionPanel}>
              <Text style={styles.prompt}>{currentQuestion.prompt}</Text>
            </View>

            {result ? (
              <View style={[styles.feedback, result.isCorrect ? styles.correctFeedback : styles.wrongFeedback]}>
                <Text style={styles.feedbackTitle}>{result.feedback}</Text>
                <Text style={styles.feedbackText}>정답: {result.expectedAnswer}</Text>
                <Text style={styles.feedbackText}>{currentQuestion.explanation}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={[styles.answerDock, answerDockStyle]}>
            <TextInput
              value={answer}
              onChangeText={updateAnswer}
              placeholder="답안 입력"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              style={styles.input}
              onSubmitEditing={submitAnswer}
            />

            <Pressable style={[styles.actionButton, styles.primaryButton]} onPress={answerActionHandler}>
              <Text style={styles.primaryButtonText}>{answerActionLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        onRequestClose={() => setCategorySelectorOpen(false)}
        transparent
        visible={categorySelectorOpen}
      >
        <View style={styles.categorySelectorModal}>
          <Pressable
            accessibilityLabel="카테고리 선택 닫기"
            accessibilityRole="button"
            onPress={() => setCategorySelectorOpen(false)}
            style={styles.categorySelectorBackdrop}
          />
          <View style={[styles.categorySelectorSheet, categorySelectorSheetStyle]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>카테고리 선택</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setCategorySelectorOpen(false)}
                style={({ pressed }) => [styles.sheetCloseButton, pressed && styles.sheetCloseButtonPressed]}
              >
                <Text style={styles.sheetCloseText}>닫기</Text>
              </Pressable>
            </View>

            <View style={styles.categoryOptions}>
              {categoryOptions.map((option) => {
                const active = option.value === category;

                return (
                  <Pressable
                    accessibilityRole="menuitem"
                    key={option.value}
                    onPress={() => selectCategoryOption(option)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  layout: {
    flex: 1,
  },
  contentScroller: {
    flex: 1,
  },
  screen: {
    flexGrow: 1,
    gap: compactScreenGap,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  appTitle: {
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: 20,
    fontWeight: "800",
  },
  counter: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: spacing.md,
  },
  rangeButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  rangeButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  categorySelectorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "space-between",
  },
  categorySelectorInfo: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  categorySelectorSummary: {
    alignItems: "center",
    flexDirection: "row",
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
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "800",
    minWidth: 0,
  },
  selectedCategoryCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  categorySelectorButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexShrink: 0,
    justifyContent: "center",
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.md,
  },
  categorySelectorButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  categorySelectorButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  questionPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: compactQuestionPadding,
  },
  prompt: {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 25,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 16,
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  answerDock: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  actionButton: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRadius: radius.md,
    justifyContent: "center",
    minHeight: touchTarget.minHeight,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800",
  },
  feedback: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
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
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  feedbackText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  categorySelectorModal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  categorySelectorBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(31, 27, 36, 0.32)",
  },
  categorySelectorSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
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
    backgroundColor: colors.primarySoft,
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
