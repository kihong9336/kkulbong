# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript + Vite 기반 퀴즈 게임 웹 앱. 과학, 역사, 지리, 문화 4개 카테고리와 easy/medium/hard 난이도를 지원하며, 원형 타이머, 콤보 시스템, 스피드 보너스, 카테고리별 정답률 차트, 리더보드를 갖춘 싱글 페이지 애플리케이션이다.

## Running

```bash
cd study-03/quiz-game
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 (dist/)
npm run lint     # ESLint 검사
```

## Architecture

### 게임 플로우 (phase 기반)

`App.tsx`가 Zustand store의 `phase` 값에 따라 화면을 전환한다. `key={phase}`로 화면 전환 시 `screen-enter` CSS 애니메이션이 재실행된다.

```
main → mode_select → playing → result → main (리셋)
```

- `main`: 메인 로비. 플레이어 카드, 최근 기록 3개, 리더보드/설정 모달
- `mode_select`: 게임 모드 선택. 전체 도전 + 카테고리별 4개 카드
- `playing`: 문제 풀이. HUD(진행률·점수·콤보) + 원형 타이머 + 퀴즈 카드
- `result`: 최종 결과. 등급 애니메이션, 점수 카운트업, 카테고리별 차트

### 디렉토리 구조

```
src/
├── App.tsx                   # phase 기반 라우터 (react-router 없음)
├── pages/                    # 화면 단위 컴포넌트
│   ├── MainScreen.tsx        # 메인 로비
│   ├── ModeSelectScreen.tsx  # 모드/카테고리 선택
│   ├── GameScreen.tsx        # 게임 플레이 화면
│   └── ResultScreen.tsx      # 결과 화면
├── components/
│   ├── Timer.tsx             # 원형 SVG 타이머 (순수 표시 컴포넌트)
│   └── QuestionCard.tsx      # 문제 + 보기 + 피드백 + 키보드 단축키
├── store/
│   └── gameStore.ts          # Zustand 전역 상태 + 게임 로직 전체
├── hooks/
│   └── useTimer.ts           # 1초 카운트다운 훅 (isAnswered 시 자동 정지)
├── data/
│   └── questions.ts          # 퀴즈 문항 데이터 + categoryLabels + difficultyLabels
└── types/
    └── index.ts              # Question, AnswerRecord, GameResult, LeaderboardEntry, UserSettings
```

### 주요 파일 역할

#### pages/

- `MainScreen.tsx`: 타이틀 gradient 텍스트, 아바타+닉네임+황금색 최고점수 카드, 최근 플레이 3개. 리더보드·설정 슬라이드업 모달 내장 (별도 phase 없이 로컬 상태로 관리)
- `ModeSelectScreen.tsx`: 전체 도전 와이드 카드(gradient border) + 카테고리별 2×2 그리드. 카드 클릭 시 `setCategory()` + `startGame()` 연속 호출
- `GameScreen.tsx`: HUD(진행 바·카테고리 배지·누적 점수·콤보 배지) + Timer + QuestionCard. `useTimer`로 카운트다운, `isAnswered` 후 정답 1.5초/오답 3초 자동 진행
- `ResultScreen.tsx`: 등급 S shimmer·A~D 컬러 분기, 점수 카운트업(1.5초), 스피드+콤보 breakdown, 카테고리별 막대 그래프(1초 애니메이션)

#### components/

- `Timer.tsx`: 원형 SVG 타이머. props: `timeRemaining`, `timeLimit`. 30→11s 파랑 / 10→6s 주황 / ≤5s 빨강+pulse. 순수 표시 컴포넌트 (타이머 로직은 `useTimer` 훅)
- `QuestionCard.tsx`: 문제 텍스트 + A/B/C/D 보기 버튼. `isAnswered` 시 정답 초록/오답 빨강 피드백 + 오답일 때 해설 슬라이드다운. 키보드 단축키(A/B/C/D) 지원

### 상태 관리 (Zustand)

`gameStore.ts`의 주요 상태:

| 상태 | 설명 |
|------|------|
| `phase` | `'main' \| 'mode_select' \| 'playing' \| 'result'` |
| `isAnswered` | 현재 문제 답변 여부 (타이머 정지 트리거) |
| `lastAnswerCorrect` | 마지막 답변 정오 (자동 진행 딜레이 결정) |
| `currentCombo` | 현재 연속 정답 수 |
| `maxCombo` | 게임 내 최고 콤보 |
| `speedBonuses` | 문제별 스피드 보너스 누적 배열 |

주요 액션:

- `goToMain()` / `goToModeSelect()`: 화면 전환
- `startGame()`: 필터링 → 셔플 → 슬라이스 → `playing` phase, 콤보/보너스 초기화
- `submitAnswer(selectedAnswer, timeSpent)`: 정오 판정, 콤보 갱신, 스피드 보너스 계산, `isAnswered = true`
- `nextQuestion()`: 인덱스 증가 + `isAnswered = false` + `timeRemaining` 리셋. 마지막 문제면 `finishGame()` 호출
- `finishGame()`: 기본점수(정답수/전체×1000) + 스피드보너스 + 콤보보너스(3+콤보×10) = 최종 점수. localStorage 저장
- `resetGame()`: `main` phase로 초기화
- `updateSettings()`: 설정 변경 + localStorage 저장

### 점수 계산

```
최종 점수 = 기본 점수 + 스피드 보너스 + 콤보 보너스
기본 점수  = round(정답수 / 전체문제수 × 1000)
스피드 보너스 = 정답 시 (남은시간 / 제한시간) × 5점 (문제당, 소수점 1자리)
콤보 보너스  = maxCombo × 10점 (3콤보 이상일 때만)
```

### 데이터 지속성 (localStorage)

| 키 | 내용 |
|----|------|
| `quiz-results` | 최근 50개 `GameResult` |
| `quiz-leaderboard` | 상위 20개 `LeaderboardEntry` (점수 내림차순) |
| `quiz-settings` | `UserSettings` (닉네임, 문제 수, 시간제한, 사운드) |

### 애니메이션 (index.css)

| 클래스 | 용도 |
|--------|------|
| `screen-enter` | phase 전환 시 fade + slide-up |
| `fade-in-up` + `option-item:nth-child` | 보기 버튼 stagger 등장 |
| `bounce-in` | 결과 아이콘 |
| `shake` | 오답 피드백 |
| `timer-urgent` | 타이머 ≤5초 pulse |
| `grade-pop` | 등급 문자 팝 |
| `score-reveal` | 점수 지연 등장 |
| `slide-down` | 해설·다음버튼 슬라이드 |
| `combo-badge` | 콤보 배지 슬라이드인 |
| `modal-up` | 모달 슬라이드업 |
| `shimmer` | S등급 황금 shimmer |

## Tech Stack

| 분류 | 라이브러리 |
|------|-----------|
| 프레임워크 | React 19 + TypeScript 5 |
| 빌드 | Vite 7 |
| 상태관리 | Zustand 5 |
| 스타일 | Tailwind CSS 4 |
| 아이콘 | lucide-react |

## Question Data Structure

```ts
interface Question {
  id: string;
  category: 'science' | 'history' | 'geography' | 'culture';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];      // 4개 보기
  correctAnswer: number;  // options 배열 인덱스
  explanation: string;    // 정답 해설
}
```

문항 추가 시 `src/data/questions.ts`에 위 구조로 추가한다.
