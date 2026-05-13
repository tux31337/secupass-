---
part: security_general
topicId: information-protection-overview
status: internal_source_note
appBundle: false
createdAt: 2026-05-13
---

# 정보보호 개요

> [!warning] 내부 원천 자료
> 이 문서는 문제 제작용 내부 원천 자료다. 앱 번들에는 이 문서를 포함하지 않고, 앱 문항의 지문과 해설은 별도로 재작성한다.

> [!info] 정보보호 정의
> 조직의 정보자산이 다양한 내외부 위협으로부터 **기밀성 · 무결성 · 가용성**이 보장될 수 있도록
> 관리적 · 기술적 · 물리적 보호조치를 마련하는 것

---

## 보안의 3분류

> [!note]- 관리적 보안
> - 정보보호 정책 / 표준 / 지침 / 절차 수립 및 시행
> - 정보보호 조직 및 인력 구성

> [!note]- 기술적 보안
> - 보안 솔루션 (보안 장비 + 보안 소프트웨어)
> - 보안 설정
> - 개발 보안 (시큐어 코딩)

> [!note]- 물리적 보안
> - 시설물 / 장비
> - 출입통제 · 시건장치 · CCTV

---

## 정보보호의 목표 - CIA Triad + 확장 요소

> [!tip] 접근통제 구성요소
> **주체(Subject)** · **객체(Object)** · **접근(Access)**

> [!example] 기밀성 (Confidentiality)
> 오직 **인가된 주체**만이 **알 필요성(Need-to-Know)** 에 근거하여 정보자산에 접근하도록 보장
>
> 암호학적 도구
> - 대칭키 암호화
> - 비대칭키 암호화

> [!example] 무결성 (Integrity)
> 권한 있는 자만이 정보자산에 접근하여 **생성 / 변경 / 삭제**할 수 있도록 보장
>
> 암호학적 도구
> - 암호학적 해시함수
> - 메시지 인증 코드 (MAC)
> - 디지털 서명 / 전자서명

> [!example] 가용성 (Availability)
> 권한 있는 자의 정보자산 접근 필요 시 **언제든지 접근**할 수 있도록 보장
>
> 가용성 확보 기법
> - 장비 이중화 구성
> - 서버 클러스터링 구성
> - 디스크 RAID 구성
> - 백업 및 소산 관리
> - 재해복구센터 구축

---

## 확장 요소

> [!example] 인증성 (Authenticity)
> **사용자 인증**과 **메시지 인증**으로 구분
>
> **사용자 인증** - 주체의 신원(ID)이 주장된 실체와 일치함을 보장
>
> | 방식 | 설명 | 예시 |
> |---|---|---|
> | 지식 기반 인증 | 알고 있는 것 | 패스워드 |
> | 소유 기반 인증 | 가지고 있는 것 | OTP · 스마트카드 |
> | 존재 기반 인증 | 자신의 것 | 지문 · 홍채 |
>
> **메시지 인증** - 수신 메시지가 올바른 상대방이 보낸 것임을 인증
> - 메시지 인증 코드 (MAC)
> - 디지털 서명 / 전자서명

> [!example] 책임성 (Accountability)
> 정보자산에 접근하는 자가 접근 결과에 대해 **책임지도록 보장**
>
> **책임 추적성** - 주체를 고유하게 식별하여 행위를 추적할 수 있도록 보장
> - 감사(Audit) · 로깅(Logging)
>
> **부인방지 (Non-repudiation)** - 주체가 한 행위를 나중에 **부인하지 못하도록** 보장
> - 디지털 서명 / 전자서명

---

> [!warning] 출제 포인트
> - 보안 3분류: **관리적 · 기술적 · 물리적**
> - CIA Triad 각 요소 정의 및 암호학적 도구 연결
> - **가용성 확보 기법** 5가지 암기
> - 인증 방식 3가지: **지식 · 소유 · 존재** 기반
> - 책임성 = **책임 추적성(로깅)** + **부인방지(디지털 서명)**
> - 부인방지 도구 = **디지털 서명 / 전자서명**

## 개념 후보

| conceptId | 개념 | v1 단답화 방향 | 향후 서술형 방향 |
|---|---|---|---|
| security-general-info-protection-definition | 정보보호 정의 | CIA와 보호조치 키워드 확인 | 정보보호 정의와 보호조치 분류 설명 |
| security-general-security-classification | 보안의 3분류 | 관리적/기술적/물리적 보안 판별 | 각 보안 분류와 예시 비교 |
| security-general-access-control-elements | 접근통제 구성요소 | 주체/객체/접근 암기 | 접근통제 흐름 설명 |
| security-general-cia-confidentiality | 기밀성 | 기밀성 정의 및 도구 확인 | Need-to-Know와 암호화 연결 설명 |
| security-general-cia-integrity | 무결성 | 무결성 정의 및 도구 확인 | 해시, MAC, 전자서명 역할 비교 |
| security-general-cia-availability | 가용성 | 가용성 정의 및 확보 기법 확인 | 가용성 확보 설계 예시 설명 |
| security-general-authentication-factors | 사용자 인증 방식 | 지식/소유/존재 기반 구분 | 인증 요소별 장단점 설명 |
| security-general-message-authentication | 메시지 인증 | MAC/전자서명 도구 확인 | 사용자 인증과 메시지 인증 비교 |
| security-general-accountability | 책임성 | 책임 추적성과 부인방지 구성 확인 | 로깅과 전자서명의 책임성 기여 설명 |
| security-general-non-repudiation | 부인방지 | 부인방지 도구 확인 | 부인방지와 전자서명 관계 설명 |
