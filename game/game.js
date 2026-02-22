/**
 * 꿀봉 매치 - 쓰리매치 퍼즐 게임
 *
 * [코드 구조 설명 - 비개발자용]
 * 이 파일은 게임의 모든 동작을 담당해요.
 * 크게 5개 부분으로 나뉩니다:
 *   1. 게임 상태(데이터) 관리
 *   2. 게임판 그리기
 *   3. 블록 교환 & 매치 감지
 *   4. 제거 & 채움
 *   5. 점수 & 타이머
 */

// ============================================================
// 1. 상수 & 게임 상태
// ============================================================

const ROWS = 8;          // 행 수
const COLS = 8;          // 열 수
const TYPES = 6;         // 블록 종류 수
const GAME_TIME = 60;    // 제한 시간(초)

// 블록 이모지 (눈에 보이는 아이콘)
const EMOJIS = ['🍎', '🫐', '🍀', '⭐', '🍇', '🍊'];

// 게임 상태 변수
let board = [];          // 8x8 격자판 데이터 (숫자 배열)
let selected = null;     // 현재 선택된 블록 위치 {r, c}
let score = 0;           // 현재 점수
let timeLeft = GAME_TIME; // 남은 시간
let timerInterval = null; // 타이머 인터벌 ID
let isProcessing = false; // 애니메이션 중 클릭 방지용

// ============================================================
// 2. 게임 시작 & 초기화
// ============================================================

/**
 * 게임을 처음 시작하거나 재시작할 때 호출
 */
function startGame() {
  // 상태 초기화
  score = 0;
  timeLeft = GAME_TIME;
  selected = null;
  isProcessing = false;

  // 점수판 초기화
  updateScoreDisplay();
  updateTimerDisplay();

  // 게임 오버 화면 숨기기
  document.getElementById('overlay').classList.remove('show');

  // 타이머 재시작
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);

  // 게임판 초기화 (매치 없는 상태로)
  initBoard();
  renderBoard();
}

/**
 * 8x8 격자판에 블록을 랜덤 배치
 * (단, 처음부터 3개 연속이 없도록)
 */
function initBoard() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = randomType(r, c);
    }
  }
}

/**
 * 특정 위치에 올 수 있는 블록 타입을 랜덤 선택
 * (좌우, 위아래로 이미 2개 연속이면 그 타입 제외)
 */
function randomType(r, c) {
  let excluded = new Set();

  // 가로: 이미 왼쪽 2칸이 같은 타입이면 제외
  if (c >= 2 && board[r][c-1] === board[r][c-2]) {
    excluded.add(board[r][c-1]);
  }
  // 세로: 이미 위쪽 2칸이 같은 타입이면 제외
  if (r >= 2 && board[r-1][c] === board[r-2][c]) {
    excluded.add(board[r-1][c]);
  }

  let type;
  do {
    type = Math.floor(Math.random() * TYPES);
  } while (excluded.has(type));

  return type;
}

// ============================================================
// 3. 화면에 게임판 그리기 (렌더링)
// ============================================================

/**
 * board 배열을 읽어서 HTML 화면에 블록을 표시
 */
function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = ''; // 기존 내용 지우기

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const block = document.createElement('div');
      block.className = 'block';
      block.dataset.type = board[r][c];
      block.dataset.r = r;
      block.dataset.c = c;
      block.textContent = EMOJIS[board[r][c]];

      // 클릭 이벤트 연결
      block.addEventListener('click', () => onBlockClick(r, c));

      boardEl.appendChild(block);
    }
  }
}

/**
 * 특정 위치의 블록 DOM 요소를 가져옴
 */
function getBlockEl(r, c) {
  return document.querySelector(`.block[data-r="${r}"][data-c="${c}"]`);
}

// ============================================================
// 4. 블록 클릭 & 교환 처리
// ============================================================

/**
 * 블록을 클릭했을 때 실행
 */
function onBlockClick(r, c) {
  // 처리 중이면 클릭 무시
  if (isProcessing) return;
  // 타이머 종료면 클릭 무시
  if (timeLeft <= 0) return;

  if (selected === null) {
    // 첫 번째 클릭: 선택
    selected = { r, c };
    getBlockEl(r, c).classList.add('selected');
  } else {
    // 두 번째 클릭
    const prev = selected;
    selected = null;
    getBlockEl(prev.r, prev.c).classList.remove('selected');

    // 같은 블록을 다시 클릭하면 선택 해제
    if (prev.r === r && prev.c === c) return;

    // 인접한 블록인지 확인 (상하좌우만, 대각선 불가)
    const dr = Math.abs(prev.r - r);
    const dc = Math.abs(prev.c - c);
    if (dr + dc !== 1) {
      // 인접하지 않으면 새로 선택
      selected = { r, c };
      getBlockEl(r, c).classList.add('selected');
      return;
    }

    // 교환 시도
    trySwap(prev.r, prev.c, r, c);
  }
}

/**
 * 두 블록을 교환하고, 매치가 없으면 되돌림
 */
async function trySwap(r1, c1, r2, c2) {
  isProcessing = true;

  // 교환
  swapBlocks(r1, c1, r2, c2);
  renderBoard();

  // 매치 확인
  const matches = findAllMatches();

  if (matches.size === 0) {
    // 매치 없음 → 0.3초 후 되돌리기
    await delay(300);
    swapBlocks(r1, c1, r2, c2);
    renderBoard();
  } else {
    // 매치 있음 → 제거 & 채움 처리
    await processMatches(0);
  }

  isProcessing = false;
}

/**
 * board 배열에서 두 위치의 값을 교환
 */
function swapBlocks(r1, c1, r2, c2) {
  const temp = board[r1][c1];
  board[r1][c1] = board[r2][c2];
  board[r2][c2] = temp;
}

// ============================================================
// 5. 매치 감지
// ============================================================

/**
 * 전체 보드에서 3개 이상 연속된 블록을 모두 찾아 반환
 * 반환값: Set of "r,c" 문자열
 */
function findAllMatches() {
  const matched = new Set();

  // 가로 매치 검사
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 2; c++) {
      const type = board[r][c];
      if (type !== null && type === board[r][c+1] && type === board[r][c+2]) {
        // 연속이 얼마나 이어지는지 확인
        let end = c + 2;
        while (end + 1 < COLS && board[r][end+1] === type) end++;
        for (let k = c; k <= end; k++) matched.add(`${r},${k}`);
        c = end; // 이미 처리한 범위 건너뜀
      }
    }
  }

  // 세로 매치 검사
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 2; r++) {
      const type = board[r][c];
      if (type !== null && type === board[r+1][c] && type === board[r+2][c]) {
        let end = r + 2;
        while (end + 1 < ROWS && board[end+1][c] === type) end++;
        for (let k = r; k <= end; k++) matched.add(`${k},${c}`);
        r = end;
      }
    }
  }

  return matched;
}

// ============================================================
// 6. 매치 처리: 제거 → 낙하 → 채움 → 반복
// ============================================================

/**
 * 매치된 블록을 제거하고, 새 블록으로 채우는 전체 과정
 * combo: 연쇄 횟수 (콤보)
 */
async function processMatches(combo) {
  const matches = findAllMatches();
  if (matches.size === 0) return;

  // 점수 계산
  const points = matches.size * 10 + (matches.size > 3 ? 20 : 0) + combo * 10;
  score += points;
  updateScoreDisplay();

  // 콤보 메시지 표시
  if (combo > 0) showComboMessage(combo + 1);

  // 제거 애니메이션
  matches.forEach(key => {
    const [r, c] = key.split(',').map(Number);
    const el = getBlockEl(r, c);
    if (el) el.classList.add('removing');
    board[r][c] = null; // 데이터에서 제거
  });

  await delay(350); // 애니메이션 대기

  // 블록 낙하 (빈 칸 위로 채우기)
  dropBlocks();

  // 새 블록 채움
  fillNewBlocks();

  // 화면 다시 그리기
  renderBoard();

  await delay(200); // 낙하 후 잠깐 대기

  // 연쇄 매치 확인 (재귀)
  const nextMatches = findAllMatches();
  if (nextMatches.size > 0) {
    await processMatches(combo + 1);
  }
}

/**
 * null(빈 칸) 위로 블록을 내림
 * (중력처럼: 빈 칸이 있으면 위의 블록이 아래로 내려옴)
 */
function dropBlocks() {
  for (let c = 0; c < COLS; c++) {
    // 해당 열에서 null이 아닌 블록만 추출 (아래부터)
    let nonNull = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][c] !== null) nonNull.push(board[r][c]);
    }
    // 아래부터 다시 채우고, 위쪽은 null로
    for (let r = ROWS - 1; r >= 0; r--) {
      board[r][c] = nonNull.length > 0 ? nonNull.shift() : null;
    }
  }
}

/**
 * 남은 null 칸에 새 블록을 랜덤으로 채움
 */
function fillNewBlocks() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === null) {
        board[r][c] = Math.floor(Math.random() * TYPES);
      }
    }
  }
}

// ============================================================
// 7. 점수 & 타이머
// ============================================================

function updateScoreDisplay() {
  document.getElementById('score').textContent = score.toLocaleString();
}

function updateTimerDisplay() {
  document.getElementById('time-val').textContent = timeLeft;
  const timerEl = document.getElementById('timer');
  if (timeLeft <= 10) {
    timerEl.classList.add('urgent'); // 10초 이하: 빨간 점멸
  } else {
    timerEl.classList.remove('urgent');
  }
}

/**
 * 1초마다 호출되는 타이머
 */
function tick() {
  timeLeft--;
  updateTimerDisplay();
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    gameOver();
  }
}

function gameOver() {
  document.getElementById('final-score').textContent = score.toLocaleString();
  document.getElementById('overlay').classList.add('show');
}

// ============================================================
// 8. 유틸리티
// ============================================================

/**
 * 콤보 메시지 화면 중앙에 표시
 */
function showComboMessage(combo) {
  const el = document.getElementById('combo-msg');
  el.textContent = `${combo} 콤보!`;
  el.classList.remove('show');
  // 강제 리플로우로 애니메이션 재시작
  void el.offsetWidth;
  el.classList.add('show');
}

/**
 * ms 밀리초 동안 기다리는 함수
 * (애니메이션 사이 타이밍 조절용)
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// 9. 게임 자동 시작
// ============================================================
startGame();
