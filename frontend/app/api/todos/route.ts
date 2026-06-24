import { NextRequest, NextResponse } from "next/server";

// 클라이언트가 FastAPI(8000)에 바로 요청하면 CORS 문제가 생기고 백엔드 주소도 노출돼요.
// 그래서 같은 출처(localhost:3000)인 이 route.ts를 한 번 거쳐가요.

// 목록 조회(GET)를 FastAPI로 전달해요.
// ?filter=, ?search= 쿼리를 그대로 넘겨 서버에서 필터링/검색하게 해요.
export async function GET(request: NextRequest) {
  const { search } = new URL(request.url); // "?filter=active&search=병원" 같은 쿼리 문자열
  const res = await fetch(`${process.env.BACKEND_URL}/todos${search}`, {
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// 새 Todo 생성(POST)을 FastAPI로 전달해요.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${process.env.BACKEND_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
