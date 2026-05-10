import type { ShortQuestion, SourceType } from "../types.ts";

export type QuestionBankValidationOptions = {
  v1LaunchOnly?: boolean;
};

export type QuestionBankValidationResult = {
  valid: boolean;
  errors: string[];
};

export const questionBank: ShortQuestion[] = [
  {
    id: "web-001",
    category: "web_security",
    difficulty: "basic",
    title: "SQL Injection",
    prompt: "사용자 입력값으로 SQL 쿼리 구조를 바꾸어 인증 우회나 데이터 조회를 시도하는 공격 기법은?",
    referenceAnswer: "SQL Injection",
    acceptableAnswers: [
      {
        value: "SQL Injection",
        caseSensitive: false,
        aliases: ["SQLi", "SQL 삽입"],
      },
    ],
    explanation: "SQL Injection은 입력값 검증과 바인딩이 부족할 때 쿼리 의미를 바꾸는 공격이다.",
    sourceType: "rewritten",
  },
  {
    id: "system-001",
    category: "system_security",
    difficulty: "basic",
    title: "chmod",
    prompt: "Linux에서 파일이나 디렉터리의 권한을 변경할 때 사용하는 명령어는?",
    referenceAnswer: "chmod",
    acceptableAnswers: [
      {
        value: "chmod",
        caseSensitive: true,
      },
    ],
    explanation: "chmod는 파일 모드 비트를 변경하는 명령어이며 명령어 표기는 소문자로 다룬다.",
    sourceType: "rewritten",
  },
  {
    id: "network-001",
    category: "network_security",
    difficulty: "basic",
    title: "VPN",
    prompt: "공중망 위에서 암호화된 사설 통신 터널을 제공하는 기술은?",
    referenceAnswer: "VPN",
    acceptableAnswers: [
      {
        value: "VPN",
        caseSensitive: false,
        aliases: ["Virtual Private Network"],
      },
    ],
    explanation: "VPN은 터널링과 암호화를 이용해 사설망과 유사한 통신 경로를 만든다.",
    sourceType: "rewritten",
  },
  {
    id: "crypto-001",
    category: "cryptography",
    difficulty: "intermediate",
    title: "AES",
    prompt: "128비트 블록을 사용하는 대표적인 대칭키 블록 암호 알고리즘은?",
    referenceAnswer: "AES",
    acceptableAnswers: [
      {
        value: "AES",
        caseSensitive: false,
        aliases: ["Advanced Encryption Standard"],
      },
    ],
    explanation: "AES는 대칭키 블록 암호이며 128비트 블록과 128/192/256비트 키를 사용한다.",
    sourceType: "rewritten",
  },
  {
    id: "app-001",
    category: "application_security",
    difficulty: "intermediate",
    title: "CSRF",
    prompt: "사용자가 인증된 상태를 악용해 원치 않는 요청을 보내게 만드는 웹 공격은?",
    referenceAnswer: "CSRF",
    acceptableAnswers: [
      {
        value: "CSRF",
        caseSensitive: false,
        aliases: ["Cross Site Request Forgery", "사이트 간 요청 위조"],
      },
    ],
    explanation: "CSRF는 사용자의 인증 상태를 이용하므로 토큰 검증과 SameSite 쿠키 설정이 방어에 쓰인다.",
    sourceType: "rewritten",
  },
  {
    id: "management-001",
    category: "management_security",
    difficulty: "basic",
    title: "ISMS",
    prompt: "조직의 정보보호 관리체계를 수립, 운영, 점검, 개선하는 체계는?",
    referenceAnswer: "ISMS",
    acceptableAnswers: [
      {
        value: "ISMS",
        caseSensitive: false,
        aliases: ["Information Security Management System"],
      },
    ],
    explanation: "ISMS는 정보보호 정책, 위험관리, 통제 운영을 체계적으로 관리하는 프레임워크다.",
    sourceType: "rewritten",
  },
];

const ORIGINAL_SOURCE_TYPES = new Set<SourceType>(["official_original", "licensed_original"]);

export function validateQuestionBank(
  questions: ShortQuestion[],
  options: QuestionBankValidationOptions = {},
): QuestionBankValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();

  questions.forEach((question, index) => {
    const label = question.id || `index ${index}`;

    if (ids.has(question.id)) {
      errors.push(`duplicate id: ${question.id}`);
    }
    ids.add(question.id);

    if (!Array.isArray(question.acceptableAnswers) || question.acceptableAnswers.length === 0) {
      errors.push(`${label}: at least one acceptable answer is required`);
    }

    question.acceptableAnswers?.forEach((answer, answerIndex) => {
      if (typeof answer.caseSensitive !== "boolean") {
        errors.push(`${label}: acceptableAnswers[${answerIndex}].caseSensitive must be boolean`);
      }
    });

    if (ORIGINAL_SOURCE_TYPES.has(question.sourceType) && !question.licenseRef) {
      errors.push(`${label}: licenseRef is required for ${question.sourceType}`);
    }

    if (options.v1LaunchOnly === true && question.sourceType !== "rewritten") {
      errors.push(`${label}: v1 launch content must use sourceType rewritten`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
