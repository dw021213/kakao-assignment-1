# 3차 과제 — Next.js + FastAPI Todo 앱

2차 과제(React + 로컬스토리지) Todo 앱을 **Next.js(App Router) + FastAPI** 풀스택 구조로 옮긴 과제예요.
2차의 CRUD·상태 필터뿐 아니라 **일간/주간 날짜 뷰와 검색**까지 옮겼어요.

- 설계 기획서(plan): [docs/설계-기획.md](./docs/설계-기획.md)
- 개발 방법론·AI 활용 정리는 **GitHub 이슈**(과제 3 제출)에 적었어요.

## 구조
```
나의 과제 코드/
├── frontend/   # Next.js (App Router)
├── backend/    # FastAPI (main.py 단일 파일) + SQLite + test_main.py
└── docs/       # 설계 문서
```

## 구현 범위
- 필수 미션 전부 (FastAPI CRUD / 목록·생성·수정 페이지 / loading·error / route.ts·actions.ts / 환경변수)
- 도전 1: 상태별 필터링 (URL 파라미터 → 서버 필터링)
- 도전 2: 검색 (URL 파라미터 → 서버 검색)
- 일간/주간 날짜 뷰 (주 이동·요일 선택·날짜별 개수, 선택한 날짜의 할 일만 표시)

## 실행 방법

### 1) 백엔드 (터미널 1)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000  (문서: /docs)
pytest                       # (선택) 자동 테스트 실행
```

### 2) 프론트엔드 (터미널 2 — 새 터미널)
```bash
cd frontend
npm install
npm run dev                  # http://localhost:3000
```

브라우저에서 `http://localhost:3000` → `/todos`로 이동돼요. (백엔드를 먼저 켜두세요)

## 환경변수
- `frontend/.env.local` : `NEXT_PUBLIC_API_URL`, `BACKEND_URL`
- `backend/.env.local`  : `DATABASE_URL`

(`.env.local`은 `.gitignore`에 포함돼 커밋되지 않아요. 예시는 위 설계 문서 참고)
