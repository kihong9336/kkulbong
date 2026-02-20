# 쇼핑 리스트 앱

간단하게 쇼핑 목록을 관리할 수 있는 웹 앱입니다.

**라이브 데모:** https://kihong9336.github.io/kkulbong/study-06/

## 기능

- 아이템 추가 (버튼 클릭 또는 Enter 키)
- 체크박스로 구매 완료 표시
- 아이템 삭제
- 전체/완료 개수 요약 표시
- 데이터 자동 저장 (localStorage)

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | GitHub Pages 배포용 (순수 HTML/CSS/JS, localStorage 저장) |
| `shopping_list.html` | 로컬 실행용 정적 파일 |
| `shopping_list.py` | Flask 서버 버전 (JSON 파일로 서버 저장) |

## 로컬 실행

### 정적 파일 (백엔드 불필요)
브라우저에서 `shopping_list.html` 파일을 직접 열면 됩니다.

### Flask 서버 버전
```bash
pip3 install flask
python3 shopping_list.py
```
실행 후 브라우저가 자동으로 `http://127.0.0.1:5001` 에 열립니다.

> Flask 버전은 데이터를 `shopping_data.json`에 저장하며, REST API(`/api/items`)를 통해 아이템을 관리합니다.
