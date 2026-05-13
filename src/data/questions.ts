import { EXAM_PARTS, type ShortQuestion, type SourceType } from "../types.ts";

export type QuestionBankValidationOptions = {
  v1LaunchOnly?: boolean;
};

export type QuestionBankValidationResult = {
  valid: boolean;
  errors: string[];
};

const INITIAL_SEED_NOTE = "docs/content-sources/seed/initial-short-answer-seed.md";
const SECURITY_GENERAL_OVERVIEW_NOTE =
  "docs/content-sources/security-general/information-protection-overview.md";

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
    examPart: "web_security",
    conceptId: "web-security-sql-injection",
    sourceNoteRefs: [INITIAL_SEED_NOTE],
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
    examPart: "system_security",
    conceptId: "system-security-linux-chmod",
    sourceNoteRefs: [INITIAL_SEED_NOTE],
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
    examPart: "network_security",
    conceptId: "network-security-vpn",
    sourceNoteRefs: [INITIAL_SEED_NOTE],
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
    examPart: "cryptography",
    conceptId: "cryptography-aes",
    sourceNoteRefs: [INITIAL_SEED_NOTE],
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
    examPart: "application_security",
    conceptId: "application-security-csrf",
    sourceNoteRefs: [INITIAL_SEED_NOTE],
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
    examPart: "management_security",
    conceptId: "management-security-isms",
    sourceNoteRefs: [INITIAL_SEED_NOTE],
  },
  {
    id: "secgen-001",
    category: "management_security",
    difficulty: "basic",
    title: "정보보호",
    prompt: "정보자산을 위협으로부터 보호해 기밀성, 무결성, 가용성을 유지하려는 활동은?",
    referenceAnswer: "정보보호",
    acceptableAnswers: [
      {
        value: "정보보호",
        caseSensitive: false,
        aliases: ["정보 보호", "Information Security"],
      },
    ],
    explanation: "정보보호는 정보자산에 대해 CIA가 유지되도록 관리적, 기술적, 물리적 보호조치를 적용하는 활동이다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-info-protection-definition",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-002",
    category: "management_security",
    difficulty: "basic",
    title: "관리적 보안",
    prompt: "보안 정책, 표준, 지침, 절차를 만들고 정보보호 조직을 운영하는 보안 분류는?",
    referenceAnswer: "관리적 보안",
    acceptableAnswers: [
      {
        value: "관리적 보안",
        caseSensitive: false,
        aliases: ["관리 보안", "Administrative Security"],
      },
    ],
    explanation: "관리적 보안은 정책, 절차, 조직, 인력처럼 보안 운영 체계를 정하는 영역이다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-security-classification",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-003",
    category: "management_security",
    difficulty: "basic",
    title: "기술적 보안",
    prompt: "보안 장비, 보안 소프트웨어, 보안 설정, 시큐어 코딩처럼 기술 수단으로 구현하는 보안 분류는?",
    referenceAnswer: "기술적 보안",
    acceptableAnswers: [
      {
        value: "기술적 보안",
        caseSensitive: false,
        aliases: ["기술 보안", "Technical Security"],
      },
    ],
    explanation: "기술적 보안은 솔루션, 설정, 개발 보안처럼 시스템과 소프트웨어에 적용되는 보호 영역이다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-security-classification",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-004",
    category: "management_security",
    difficulty: "basic",
    title: "물리적 보안",
    prompt: "출입통제, 시건장치, CCTV처럼 시설과 장비를 직접 보호하는 보안 분류는?",
    referenceAnswer: "물리적 보안",
    acceptableAnswers: [
      {
        value: "물리적 보안",
        caseSensitive: false,
        aliases: ["물리 보안", "Physical Security"],
      },
    ],
    explanation: "물리적 보안은 건물, 장비, 출입 구역 같은 실제 환경을 보호하는 영역이다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-security-classification",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-005",
    category: "management_security",
    difficulty: "basic",
    title: "접근통제 주체",
    prompt: "접근통제에서 파일이나 시스템에 접근을 시도하는 사용자 또는 프로세스를 무엇이라 하는가?",
    referenceAnswer: "주체",
    acceptableAnswers: [
      {
        value: "주체",
        caseSensitive: false,
        aliases: ["Subject"],
      },
    ],
    explanation: "주체는 접근을 요청하는 능동적 실체이며, 객체는 접근 대상이 되는 자원이다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-access-control-elements",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-006",
    category: "management_security",
    difficulty: "basic",
    title: "기밀성",
    prompt: "허가된 사람만 필요한 범위에서 정보를 볼 수 있게 하는 정보보호 목표는?",
    referenceAnswer: "기밀성",
    acceptableAnswers: [
      {
        value: "기밀성",
        caseSensitive: false,
        aliases: ["Confidentiality"],
      },
    ],
    explanation: "기밀성은 인가된 주체에게만 정보 접근을 허용하는 목표이며 암호화와 접근통제로 강화한다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-cia-confidentiality",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-007",
    category: "management_security",
    difficulty: "basic",
    title: "무결성",
    prompt: "정보가 허가된 방식으로만 생성, 변경, 삭제되도록 보장하는 정보보호 목표는?",
    referenceAnswer: "무결성",
    acceptableAnswers: [
      {
        value: "무결성",
        caseSensitive: false,
        aliases: ["Integrity"],
      },
    ],
    explanation: "무결성은 정보가 임의로 훼손되거나 변조되지 않도록 지키는 목표다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-cia-integrity",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-008",
    category: "management_security",
    difficulty: "basic",
    title: "가용성",
    prompt: "정상 사용자가 필요할 때 정보자산이나 서비스를 이용할 수 있게 하는 정보보호 목표는?",
    referenceAnswer: "가용성",
    acceptableAnswers: [
      {
        value: "가용성",
        caseSensitive: false,
        aliases: ["Availability"],
      },
    ],
    explanation: "가용성은 권한 있는 사용자가 필요한 시점에 자원에 접근할 수 있도록 보장하는 목표다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-cia-availability",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-009",
    category: "management_security",
    difficulty: "basic",
    title: "지식 기반 인증",
    prompt: "패스워드처럼 사용자가 알고 있는 정보를 이용해 신원을 확인하는 인증 방식은?",
    referenceAnswer: "지식 기반 인증",
    acceptableAnswers: [
      {
        value: "지식 기반 인증",
        caseSensitive: false,
        aliases: ["지식기반 인증", "Knowledge-based Authentication"],
      },
    ],
    explanation: "지식 기반 인증은 비밀번호나 PIN처럼 사용자가 기억하고 있는 요소를 확인한다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-authentication-factors",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-010",
    category: "management_security",
    difficulty: "basic",
    title: "소유 기반 인증",
    prompt: "OTP나 스마트카드처럼 사용자가 가진 물건을 이용해 신원을 확인하는 인증 방식은?",
    referenceAnswer: "소유 기반 인증",
    acceptableAnswers: [
      {
        value: "소유 기반 인증",
        caseSensitive: false,
        aliases: ["소유기반 인증", "Possession-based Authentication"],
      },
    ],
    explanation: "소유 기반 인증은 토큰, 카드, 단말기처럼 사용자가 보유한 요소를 확인한다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-authentication-factors",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-011",
    category: "management_security",
    difficulty: "basic",
    title: "존재 기반 인증",
    prompt: "지문이나 홍채처럼 사용자 고유의 신체 특성을 이용하는 인증 방식은?",
    referenceAnswer: "존재 기반 인증",
    acceptableAnswers: [
      {
        value: "존재 기반 인증",
        caseSensitive: false,
        aliases: ["존재기반 인증", "생체 인증", "Inherence-based Authentication"],
      },
    ],
    explanation: "존재 기반 인증은 지문, 홍채, 얼굴처럼 사용자의 고유한 특성을 확인한다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-authentication-factors",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-012",
    category: "cryptography",
    difficulty: "intermediate",
    title: "메시지 인증",
    prompt: "받은 메시지가 올바른 상대가 보냈고 전송 중 변조되지 않았음을 확인하는 인증은?",
    referenceAnswer: "메시지 인증",
    acceptableAnswers: [
      {
        value: "메시지 인증",
        caseSensitive: false,
        aliases: ["Message Authentication"],
      },
    ],
    explanation: "메시지 인증은 MAC이나 전자서명 등을 이용해 송신자와 메시지 변경 여부를 확인한다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-message-authentication",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-013",
    category: "management_security",
    difficulty: "intermediate",
    title: "책임 추적성",
    prompt: "사용자를 고유하게 식별하고 감사 기록이나 로그로 행위를 따라갈 수 있게 하는 책임성 요소는?",
    referenceAnswer: "책임 추적성",
    acceptableAnswers: [
      {
        value: "책임 추적성",
        caseSensitive: false,
        aliases: ["책임추적성", "추적성", "Accountability Traceability"],
      },
    ],
    explanation: "책임 추적성은 감사와 로깅을 통해 누가 어떤 행위를 했는지 확인할 수 있게 한다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-accountability",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
  {
    id: "secgen-014",
    category: "cryptography",
    difficulty: "intermediate",
    title: "부인방지",
    prompt: "행위자가 나중에 자신의 행위를 하지 않았다고 부정하지 못하게 하는 보안 성질은?",
    referenceAnswer: "부인방지",
    acceptableAnswers: [
      {
        value: "부인방지",
        caseSensitive: false,
        aliases: ["Non-repudiation", "Nonrepudiation"],
      },
    ],
    explanation: "부인방지는 행위 사실을 부정하기 어렵게 만드는 성질이며 전자서명이 대표 도구다.",
    sourceType: "rewritten",
    examPart: "security_general",
    conceptId: "security-general-non-repudiation",
    sourceNoteRefs: [SECURITY_GENERAL_OVERVIEW_NOTE],
  },
];

const ORIGINAL_SOURCE_TYPES = new Set<SourceType>(["official_original", "licensed_original"]);
const VALID_EXAM_PARTS = new Set<string>(EXAM_PARTS);

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

    if (options.v1LaunchOnly === true) {
      if (!question.examPart) {
        errors.push(`${label}: examPart is required`);
      } else if (!VALID_EXAM_PARTS.has(question.examPart)) {
        errors.push(`${label}: examPart is invalid`);
      }

      if (!question.conceptId?.trim()) {
        errors.push(`${label}: conceptId is required`);
      }

      if (!Array.isArray(question.sourceNoteRefs) || question.sourceNoteRefs.length === 0) {
        errors.push(`${label}: at least one sourceNoteRefs entry is required`);
      } else {
        question.sourceNoteRefs.forEach((sourceNoteRef, sourceNoteRefIndex) => {
          if (!sourceNoteRef.trim()) {
            errors.push(`${label}: sourceNoteRefs[${sourceNoteRefIndex}] must not be empty`);
          }
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
