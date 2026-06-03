   # Daily Todo (Vanilla JS)

날짜별로 할 일을 관리하는 Todo 웹 앱입니다. HTML / CSS / Vanilla JS만 사용했고, 데이터는 브라우저 localStorage에 저장됩니다.

## 실행 방법

1. 저장소를 클론합니다.
   ```bash
   git clone https://github.com/dw021213/kakao-assignment-1.git
   ```
2. `week-01-김동우` 브랜치로 이동합니다.
   ```bash
   git checkout week-01-김동우
   ```
3. VS Code에서 `index.html`을 열고, Live Server 확장으로 실행합니다.
   (우클릭 → Open with Live Server)

> localStorage를 사용하므로 `file://`로 직접 여는 것보다 로컬 서버로 실행하는 편이 안정적입니다.

## 폴더 구조

```
.
├── index.html   # 화면 구조
├── style.css    # 스타일 (메인 컬러 #672be0)
└── app.js       # 상태 관리 및 기능
```

## 구현 기능

### 기본 미션
- **Todo CRUD** — 추가 / 수정(prompt) / 완료 토글 / 삭제, 빈 입력 시 안내 메시지
- **상태별 필터** — 전체 / 진행 중 / 완료 탭, 선택된 탭 강조
- **일간 뷰** — 선택한 날짜의 할 일만 표시, 이전/다음 날짜 이동, 추가 시 선택한 날짜로 저장
- **localStorage 연동** — 모든 변경사항 저장, 새로고침 후에도 데이터 유지

### 도전 미션
- **주간 뷰** — 월~일 한 주를 보여주고 날짜별 할 일 개수 배지 표시, 오늘 강조, 이전/다음 주 이동

## 데이터 구조

```js
{
  id: number,        // Date.now()
  title: string,
  done: boolean,
  date: "YYYY-MM-DD" // 로컬 기준 날짜 키
}
```
