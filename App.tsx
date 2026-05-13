import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { questionBank } from "./src/data/questions.ts";
import { colors, radius, spacing, touchTarget } from "./src/design/theme.ts";
import { gradeShortAnswer, type GradeResult } from "./src/domain/grading.ts";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
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
const androidStatusBarInset = StatusBar.currentHeight ?? 0;
const androidNavigationBarInset = spacing.xxl;

export default function App() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [categorySelectorOpen, setCategorySelectorOpen] = useState(false);

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

  function selectCategory(nextCategory: CategoryFilter) {
    setCategory(nextCategory);
    setQuestionIndex(0);
    setAnswer("");
    setResult(null);
  }

  function submitAnswer() {
    setResult(gradeShortAnswer(currentQuestion, answer));
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
    <SafeAreaView style={styles.safeArea}>
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
              <Text style={styles.counter}>
                {questionIndex + 1}/{filteredQuestions.length}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setCategorySelectorOpen(true)}
              style={({ pressed }) => [
                styles.categorySelectorTrigger,
                pressed && styles.categorySelectorTriggerPressed,
              ]}
            >
              <View style={styles.categorySelectorCopy}>
                <Text style={styles.categorySelectorLabel}>학습 범위</Text>
                <Text numberOfLines={1} style={styles.selectedCategoryLabel}>
                  {selectedCategoryLabel}
                </Text>
              </View>
              <Text style={styles.selectedCategoryCount}>{selectedCategoryCount}문항</Text>
            </Pressable>

            <View style={styles.questionPanel}>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{CATEGORY_LABELS[currentQuestion.category]}</Text>
                <Text style={styles.metaText}>{DIFFICULTY_LABELS[currentQuestion.difficulty]}</Text>
              </View>
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

          <View style={styles.answerDock}>
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              placeholder="답안 입력"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              style={styles.input}
              onSubmitEditing={submitAnswer}
            />

            <View style={styles.actions}>
              <Pressable style={[styles.actionButton, styles.primaryButton]} onPress={submitAnswer}>
                <Text style={styles.primaryButtonText}>채점</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.secondaryButton]} onPress={moveNext}>
                <Text style={styles.secondaryButtonText}>다음</Text>
              </Pressable>
            </View>
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
          <View style={styles.categorySelectorSheet}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === "android" ? androidStatusBarInset : 0,
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
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
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
    fontSize: 24,
    fontWeight: "800",
  },
  counter: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
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
    backgroundColor: colors.primarySoft,
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
    fontSize: 18,
    fontWeight: "800",
  },
  selectedCategoryCount: {
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
    padding: spacing.xl,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metaText: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    color: colors.primary,
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
    backgroundColor: colors.background,
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
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
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
