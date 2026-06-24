<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# frontend — 프론트엔드 전용 지침 (Next.js 16, App Router)

루트 [`../AGENTS.md`](../AGENTS.md)에 더해, 이 폴더에만 해당하는 규칙이에요. (가까운 파일이 우선 — closest-file-wins)
위 `nextjs-agent-rules` 블록은 Next.js가 자동 생성/관리하는 부분이라 그대로 두고, 아래에 우리 규칙을 덧붙였어요.

## Next.js 16 실제로 걸렸던 주의점
- `params` / `searchParams`는 **Promise** → `await`로 꺼내요.
- `useSearchParams`를 쓰는 클라이언트 컴포넌트는 **`<Suspense>`로 감싸요.**
- effect 안에서 데이터 fetch 후 setState 직접 호출은 lint(`react-hooks/set-state-in-effect`)가 막아요 → `refreshKey` 상태를 올려 effect가 다시 돌게 해서 재조회해요.

## 명령
- 개발: `npm run dev` (3000) · 빌드: `npm run build` · 린트: `npm run lint` · 타입체크: `npx tsc --noEmit`

## 컴포넌트 규칙
- 인터랙션(클릭·입력) 있으면 `"use client"`, 보여주기만 하면 Server.
- 목록은 단일 Client 보드(`app/todos/components/TodoBoard.tsx`). 변경 후 `refreshKey`로 재조회.
- 상태 필터·검색은 URL, 선택 날짜는 client state(보고 있는 주는 파생 계산).
