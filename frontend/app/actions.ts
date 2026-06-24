"use server";

// 프론트 곳곳에서 쓰는 Todo 타입이에요. (백엔드 TodoResponse와 같은 모양)
export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  date: string | null; // "YYYY-MM-DD" (어느 날의 할 일인지)
};

// 서버에서만 쓰는 값이라 NEXT_PUBLIC_ 접두사가 없어요.
const BACKEND_URL = process.env.BACKEND_URL;

// 수정 페이지(Server Component)에서 Todo 하나를 서버에서 직접 불러올 때 써요.
// (목록 조회는 클라이언트 보드가 /api 프록시로 가져가요)
export async function getTodo(id: string): Promise<Todo | null> {
  const res = await fetch(`${BACKEND_URL}/todos/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Todo를 불러오지 못했어요.");
  return res.json();
}
