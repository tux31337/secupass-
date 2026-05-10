export const QUESTION_CATEGORIES = [
  "web_security",
  "system_security",
  "network_security",
  "cryptography",
  "application_security",
  "management_security",
] as const;

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  web_security: "웹 보안",
  system_security: "시스템 보안",
  network_security: "네트워크 보안",
  cryptography: "암호",
  application_security: "애플리케이션 보안",
  management_security: "관리 보안",
};

export const QUESTION_DIFFICULTIES = ["basic", "intermediate", "advanced"] as const;

export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  basic: "기초",
  intermediate: "중급",
  advanced: "고급",
};

export type SourceType = "rewritten" | "official_original" | "licensed_original";

export type ShortAnswerKey = {
  value: string;
  caseSensitive: boolean;
  aliases?: string[];
  note?: string;
};

export type ShortQuestion = {
  id: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  title: string;
  prompt: string;
  referenceAnswer: string;
  acceptableAnswers: ShortAnswerKey[];
  explanation: string;
  sourceType: SourceType;
  licenseRef?: string;
};
