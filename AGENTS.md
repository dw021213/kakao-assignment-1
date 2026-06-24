# AGENTS.md — 이 저장소의 에이전트 지침 (단일 소스)

AI 코딩 도구(Codex·Claude Code·Cursor 등)가 **작업 전에 읽는 프로젝트 지침**이에요.
여러 도구가 공통으로 읽는 표준 파일이라 여기 한 번만 적고, `CLAUDE.md`는 이 파일을 import해서 같이 써요.
하위 폴더에 더 구체적인 규칙이 필요하면 그 폴더의 `AGENTS.md`가 우선해요. (closest-file-wins)

## 프로젝트
3차 과제: 2차 React/로컬스토리지 Todo 앱을 **Next.js(App Router) + FastAPI**로 옮긴 풀스택 앱.
**가장 중요한 원칙: 내가 읽고 튜터에게 설명할 수 있는 코드만 남긴다.** (초급 수준 우선, 영리한 추상화 지양)

## 구조
- `frontend/` : Next.js 16 (App Router). 폴더 전용 규칙은 `frontend/AGENTS.md`.
- `backend/`  : FastAPI 단일 `main.py` + SQLite + 자동 테스트 `test_main.py`.
- `docs/`     : 설계 문서(`설계-기획.md`). 개인 노트 `개발-방법론.md`는 gitignore.

## 실행 (두 서버를 동시에, 백엔드 먼저)
```bash
# 백엔드 (터미널 1)
cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000
# 프론트 (터미널 2)
cd frontend && npm run dev   # http://localhost:3000
```

## 검증 (AI가 준 코드를 그대로 믿지 않기)
- 백엔드: `cd backend && pytest`
- 프론트: `cd frontend && npx tsc --noEmit && npx eslint .`
- 기능을 바꾸면 작은 단위로 바로 실행해 확인.

## 코드 규칙
- 초급 수준·설명 가능. 비자명한 부분만 "왜"를 한 줄 주석으로.
- 실제로 겪지 않은 트러블슈팅·고민은 문서에 쓰지 않기(지어내지 않기).
- 코드 전에 `docs/설계-기획.md`(plan)부터 갱신.
- 구현 후 "오버엔지니어링은 없는지, 더 단순히 못 하는지" 한 번 검토.

## 아키텍처
- 데이터는 FastAPI(SQLite)가 관리. 프론트는 API로만 접근.
- **목록 조회**: 단일 Client 보드(`frontend/app/todos/components/TodoBoard.tsx`)가 `/api/todos` 프록시로.
- **단건 조회**: 수정 페이지 Server Component가 `app/actions.ts`의 `getTodo`로 FastAPI 직접 호출.
- **변경(생성/수정/삭제)**: 클라 → `app/api/.../route.ts` 프록시 → FastAPI. 변경 후 `refreshKey`로 재조회.
- **상태 필터·검색**: URL(`?filter=`, `?search=`)로 관리(파생 상태). 서버(FastAPI)에서 필터링·검색.
- **날짜**: `selectedDate` 하나만 상태로 두고 보고 있는 주는 거기서 파생 계산. 날짜 필터는 클라이언트.
- 환경값은 `.env.local`. 브라우저에서 쓰는 값만 `NEXT_PUBLIC_` 접두사.
