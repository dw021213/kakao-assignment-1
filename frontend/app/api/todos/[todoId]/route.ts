import { NextRequest, NextResponse } from "next/server";

// Next.js 16부터 params는 Promise라서 await로 꺼내요.
type Params = { params: Promise<{ todoId: string }> };

// 수정 요청을 FastAPI로 전달해요.
export async function PUT(request: NextRequest, { params }: Params) {
  const { todoId } = await params;
  const body = await request.json();
  const res = await fetch(`${process.env.BACKEND_URL}/todos/${todoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// 삭제 요청을 FastAPI로 전달해요. (성공 시 본문 없이 204)
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { todoId } = await params;
  await fetch(`${process.env.BACKEND_URL}/todos/${todoId}`, {
    method: "DELETE",
  });
  return new NextResponse(null, { status: 204 });
}
