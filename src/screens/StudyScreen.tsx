import { useMemo, useState } from "react";

import { AnswerDock } from "../components/AnswerDock.tsx";
import {
  CategorySelector,
  type CategoryFilter,
  type CategoryOption,
} from "../components/CategorySelector.tsx";
import { FeedbackPanel } from "../components/FeedbackPanel.tsx";
import { QuestionCard } from "../components/QuestionCard.tsx";
import { ScreenScaffold } from "../components/ScreenScaffold.tsx";
import { StudyHeader } from "../components/StudyHeader.tsx";
import { questionBank } from "../data/questions.ts";
import type { ThemeColors } from "../design/theme.ts";
import { gradeShortAnswer, type GradeResult } from "../domain/grading.ts";
import { CATEGORY_LABELS, QUESTION_CATEGORIES } from "../types.ts";

type StudyScreenProps = {
  colors: ThemeColors;
  isDarkMode: boolean;
};

export function StudyScreen({ colors, isDarkMode }: StudyScreenProps) {
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
    <ScreenScaffold
      answerDock={
        <AnswerDock
          answer={answer}
          colors={colors}
          onAnswerChange={setAnswer}
          onNext={moveNext}
          onSubmit={submitAnswer}
        />
      }
      colors={colors}
      isDarkMode={isDarkMode}
    >
      <StudyHeader colors={colors} currentIndex={questionIndex + 1} totalCount={filteredQuestions.length} />

      <CategorySelector
        colors={colors}
        onClose={() => setCategorySelectorOpen(false)}
        onOpen={() => setCategorySelectorOpen(true)}
        onSelect={selectCategoryOption}
        open={categorySelectorOpen}
        options={categoryOptions}
        selectedCategoryCount={selectedCategoryCount}
        selectedCategoryLabel={selectedCategoryLabel}
        selectedValue={category}
      />

      <QuestionCard colors={colors} question={currentQuestion} />

      {result ? <FeedbackPanel colors={colors} explanation={currentQuestion.explanation} result={result} /> : null}
    </ScreenScaffold>
  );
}
