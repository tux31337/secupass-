import { useMemo, useState } from "react";
import {
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
import { gradeShortAnswer, type GradeResult } from "./src/domain/grading.ts";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  QUESTION_CATEGORIES,
  type QuestionCategory,
} from "./src/types.ts";

type CategoryFilter = "all" | QuestionCategory;

export default function App() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);

  const filteredQuestions = useMemo(
    () =>
      category === "all"
        ? questionBank
        : questionBank.filter((question) => question.category === category),
    [category],
  );

  const currentQuestion = filteredQuestions[questionIndex] ?? filteredQuestions[0];

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>정보보안기사 단답</Text>
          <Text style={styles.counter}>
            {questionIndex + 1}/{filteredQuestions.length}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <FilterButton active={category === "all"} label="전체" onPress={() => selectCategory("all")} />
          {QUESTION_CATEGORIES.map((item) => (
            <FilterButton
              key={item}
              active={category === item}
              label={CATEGORY_LABELS[item]}
              onPress={() => selectCategory(item)}
            />
          ))}
        </ScrollView>

        <View style={styles.questionPanel}>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{CATEGORY_LABELS[currentQuestion.category]}</Text>
            <Text style={styles.metaText}>{DIFFICULTY_LABELS[currentQuestion.difficulty]}</Text>
          </View>
          <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
          <Text style={styles.prompt}>{currentQuestion.prompt}</Text>
        </View>

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

        {result ? (
          <View style={[styles.feedback, result.isCorrect ? styles.correctFeedback : styles.wrongFeedback]}>
            <Text style={styles.feedbackTitle}>{result.feedback}</Text>
            <Text style={styles.feedbackText}>정답: {result.expectedAnswer}</Text>
            <Text style={styles.feedbackText}>{currentQuestion.explanation}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

type FilterButtonProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

function FilterButton({ active, label, onPress }: FilterButtonProps) {
  return (
    <Pressable style={[styles.filterButton, active && styles.activeFilter]} onPress={onPress}>
      <Text style={[styles.filterText, active && styles.activeFilterText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7f9",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  appTitle: {
    color: "#18202f",
    fontSize: 24,
    fontWeight: "800",
  },
  counter: {
    color: "#5b6472",
    fontSize: 15,
    fontWeight: "700",
  },
  filters: {
    gap: 8,
    paddingVertical: 2,
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9dde5",
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  activeFilter: {
    backgroundColor: "#1f5f8b",
    borderColor: "#1f5f8b",
  },
  filterText: {
    color: "#364153",
    fontSize: 14,
    fontWeight: "700",
  },
  activeFilterText: {
    color: "#ffffff",
  },
  questionPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e4ea",
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaText: {
    backgroundColor: "#edf4f8",
    borderRadius: 6,
    color: "#31546d",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  questionTitle: {
    color: "#121826",
    fontSize: 22,
    fontWeight: "800",
  },
  prompt: {
    color: "#293447",
    fontSize: 17,
    lineHeight: 25,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd3df",
    borderRadius: 8,
    borderWidth: 1,
    color: "#121826",
    fontSize: 18,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: "#1f5f8b",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderColor: "#b9c3d0",
    borderWidth: 1,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: "#253348",
    fontSize: 16,
    fontWeight: "800",
  },
  feedback: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 7,
    padding: 14,
  },
  correctFeedback: {
    backgroundColor: "#eaf7ef",
    borderColor: "#8cc9a2",
  },
  wrongFeedback: {
    backgroundColor: "#fff1ed",
    borderColor: "#e3a08f",
  },
  feedbackTitle: {
    color: "#192435",
    fontSize: 17,
    fontWeight: "800",
  },
  feedbackText: {
    color: "#334155",
    fontSize: 15,
    lineHeight: 22,
  },
});
