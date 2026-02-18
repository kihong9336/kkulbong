# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript + Vite 기반 퀴즈 게임 웹 앱. 과학, 역사, 지리, 문화 4개 카테고리와 easy/medium/hard 난이도를 지원하며, 타이머, 점수 계산, 리더보드, 오답 리뷰 기능을 갖춘 싱글 페이지 애플리케이션이다.

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
`App.tsx`가 Zustand store의 `phase` 값에 따라 화면을 전환한다.

```
menu → playing → review → result → menu (리셋)
```

- `menu`: 카테고리/난이도 선택, 설정, 리더보드 확인
- `playing`: 문제 풀이 (타이머 카운트다운)
- `review`: 제출 직후 정답/오답 해설 확인
- `result`: 게임 종료 후 최종 점수 및 통계

### 주요 파일

- `src/App.tsx`: phase 값으로 컴포넌트 스위칭하는 라우터 역할
- `src/store/gameStore.ts`: Zustand 전역 상태. 게임 전체 로직(필터링, 셔플, 채점, localStorage 저장) 포함
- `src/components/MenuScreen.tsx`: 게임 시작 화면. 카테고리/난이도 선택, 설정(플레이어명, 문제 수, 시간제한), 리더보드
- `src/components/QuizScreen.tsx`: 문제 풀이 화면. 타이머, 4지선다 보기
- `src/components/ReviewScreen.tsx`: 문제별 정답 해설 화면
- `src/components/ResultScreen.tsx`: 최종 결과(점수, 정답률, 소요 시간) 및 오답 목록
- `src/hooks/useTimer.ts`: 1초 간격 카운트다운 훅. `timeLimit === 0`이면 무제한 모드
- `src/data/questions.ts`: 과학/역사/지리/문화 카테고리별 퀴즈 문항 데이터
- `src/types/index.ts`: `Question`, `AnswerRecord`, `GameResult`, `LeaderboardEntry`, `UserSettings` 타입 정의

### 상태 관리 (Zustand)

`gameStore.ts`의 주요 액션:
- `startGame()`: 카테고리/난이도 필터링 → 셔플 → 설정한 문제 수만큼 슬라이스
- `submitAnswer(selectedAnswer, timeSpent)`: 답안 기록 후 `review` phase로 전환
- `nextQuestion()`: 다음 문제로 이동, 마지막 문제면 `finishGame()` 호출
- `finishGame()`: 점수 계산(`정답수/전체 * 1000`), `GameResult` 및 `LeaderboardEntry` 생성 후 localStorage 저장
- `resetGame()`: `menu` phase로 초기화
- `updateSettings()`: 사용자 설정 변경 및 localStorage 저장

### 데이터 지속성

결과·리더보드·설정은 모두 `localStorage`에 저장된다.
- `quiz-results`: 최근 50개 게임 결과
- `quiz-leaderboard`: 상위 20개 점수
- `quiz-settings`: 플레이어명, 문제 수, 시간제한, 사운드 설정

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
