# Daily Todo (React)

1차 과제에서 Vanilla JS로 만든 날짜별 Todo 앱을, React Function Component 구조로 옮긴 버전입니다.
Vite + React + Tailwind CSS(v4)로 만들었고, 데이터는 브라우저 localStorage에 저장됩니다.

## 실행 방법

```bash
# 1. week-02-김동우 브랜치로 이동
git checkout week-02-김동우

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
# → http://localhost:5173 접속
```

## 폴더 구조

```
src/
├── App.jsx                 # 상태(tasks / selectedDate / weekOffset / filter) 관리, localStorage 저장
├── utils/
│   └── date.js             # 날짜 헬퍼 (toKey / fromKey / getMonday / getWeekDates ...)
└── components/
    ├── WeekStrip.jsx       # 주간 뷰 (한 주 날짜 + 개수 배지, 이전/다음 주)
    ├── DayNavigator.jsx    # 선택한 날짜 표시 + 이전/다음 날짜
    ├── TodoInput.jsx       # 입력창 + 추가 버튼
    ├── FilterTabs.jsx      # 전체 / 진행 중 / 완료 탭
    ├── TodoList.jsx        # 목록 (빈 상태 처리)
    └── TodoItem.jsx        # 한 항목 (완료 / 인라인 수정 / 삭제)
```

## 상태 설계

- 모든 상태는 `App.jsx`에서 `useState`로 관리하고, props로 내려줍니다.
- `tasks`와 `weekOffset`은 `useEffect` 하나로 변경될 때마다 localStorage에 자동 저장합니다.
- 선택한 날짜(`selectedDate`)는 새로고침 시 항상 오늘로 엽니다.

## 데이터 구조

```js
{
  id: number,        // Date.now()
  title: string,
  done: boolean,
  date: "YYYY-MM-DD" // 로컬 기준 날짜 키
}
```

## 구현 기능

### 기본 미션
- **Todo CRUD** — 추가 / 인라인 수정 / 완료 토글 / 삭제, 빈 입력 시 안내 메시지
- **상태별 필터** — 전체 / 진행 중 / 완료
- **일간 뷰** — 선택한 날짜의 할 일만 표시, 이전/다음 날짜 이동
- **localStorage 연동** — `useEffect`로 자동 저장, 새로고침 후에도 유지

### 도전 미션
- **주간 뷰** — 월~일 한 주 + 날짜별 개수 배지, 오늘/선택 날짜 강조, 이전/다음 주 이동 (이동한 주는 새로고침 후에도 유지)
