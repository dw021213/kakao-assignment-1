"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 생성 페이지는 입력/제출 인터랙션만 있어서 통째로 Client Component로 둬요.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 오늘 날짜를 "YYYY-MM-DD"로 (날짜 입력칸의 기본값)
function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function NewTodoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return; // 빈 값은 만들지 않아요.

    // route.ts(/api/todos)를 거쳐 FastAPI로 생성 요청이 가요.
    await fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed, date }),
    });
    router.push("/todos"); // 목록으로 돌아가요.
  }

  return (
    <main className="min-h-screen flex justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#672be0] mb-6">새 할 일</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            autoFocus
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#672be0]"
          />
          <label className="block text-sm text-gray-600">
            날짜
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#672be0]"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-[#672be0] text-white text-sm rounded-lg py-2 hover:opacity-90"
            >
              저장
            </button>
            <Link
              href="/todos"
              className="flex-1 text-center text-sm rounded-lg py-2 border border-gray-200 text-gray-600"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
