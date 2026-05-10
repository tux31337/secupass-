import type { ShortAnswerKey, ShortQuestion } from "../types.ts";

export type GradeStatus = "correct" | "incorrect" | "case_mismatch" | "empty";

export type GradeResult = {
  isCorrect: boolean;
  status: GradeStatus;
  normalizedSubmission: string;
  matchedAnswer?: string;
  expectedAnswer?: string;
  feedback: string;
};

type AnswerCandidate = {
  value: string;
  key: ShortAnswerKey;
};

export function gradeShortAnswer(question: ShortQuestion, submission: string): GradeResult {
  const normalizedSubmission = normalizeAnswer(submission);

  if (normalizedSubmission.length === 0) {
    return {
      isCorrect: false,
      status: "empty",
      normalizedSubmission,
      expectedAnswer: question.referenceAnswer,
      feedback: "답안을 입력한 뒤 채점하세요.",
    };
  }

  const candidates = question.acceptableAnswers.flatMap(toCandidates);

  for (const candidate of candidates) {
    if (isExactMatch(normalizedSubmission, candidate)) {
      return {
        isCorrect: true,
        status: "correct",
        normalizedSubmission,
        matchedAnswer: candidate.value,
        expectedAnswer: question.referenceAnswer,
        feedback: "정답입니다.",
      };
    }
  }

  const caseMismatch = candidates.find(
    (candidate) =>
      candidate.key.caseSensitive &&
      normalizedSubmission.toLocaleLowerCase() ===
        normalizeAnswer(candidate.value).toLocaleLowerCase(),
  );

  if (caseMismatch) {
    return {
      isCorrect: false,
      status: "case_mismatch",
      normalizedSubmission,
      expectedAnswer: caseMismatch.value,
      feedback: "철자는 맞지만 대소문자가 다릅니다.",
    };
  }

  return {
    isCorrect: false,
    status: "incorrect",
    normalizedSubmission,
    expectedAnswer: question.referenceAnswer,
    feedback: "오답입니다.",
  };
}

export function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function toCandidates(key: ShortAnswerKey): AnswerCandidate[] {
  return [key.value, ...(key.aliases ?? [])].map((value) => ({ value, key }));
}

function isExactMatch(submission: string, candidate: AnswerCandidate): boolean {
  const normalizedCandidate = normalizeAnswer(candidate.value);

  if (candidate.key.caseSensitive) {
    return submission === normalizedCandidate;
  }

  return submission.toLocaleLowerCase() === normalizedCandidate.toLocaleLowerCase();
}
