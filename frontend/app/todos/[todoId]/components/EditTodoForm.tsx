"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Todo } from "../../../actions";

// 서버에서 불러온 todo를 props로 받아 입력값 초기치로 써요.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditTodoForm({ todo }: { todo: Todo }) {
  const router = useRouter();
  const [title, setTitle] = useState(todo.title);
  const [completed, setCompleted] = useState(todo.completed);
  const [date, setDate] = useState(todo.date ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    // route.ts(/api/todos/{id})를 거쳐 FastAPI로 수정 요청이 가요.
    await fetch(`${API_URL}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed, completed, date }),
    });
    router.push("/todos");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          className="w-4 h-4 accent-[#672be0]"
        />
        완료됨
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
  );
}
