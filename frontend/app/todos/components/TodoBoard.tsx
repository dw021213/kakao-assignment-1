"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// 주간 뷰·날짜 선택·추가·검색·필터·토글·삭제가 모두 한 화면에서 일어나서
// 목록은 통째로 Client Component(보드)로 둬요.
type Todo = { id: number; title: string; completed: boolean; date: string | null };
type Filter = "all" | "active" | "completed";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DAY_KO = ["월", "화", "수", "목", "금", "토", "일"];
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "active", label: "진행 중" },
  { key: "completed", label: "완료" },
];

// Date → "YYYY-MM-DD" (브라우저 시간대 기준)
function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// "YYYY-MM-DD" → Date (시간대 밀림을 막으려고 직접 숫자로 만들어요)
function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// 그 날짜가 속한 주의 "월요일"을 구해요.
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0(일)~6(토)
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

// 월요일부터 7일치 날짜 배열
function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

export default function TodoBoard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 상태 필터·검색은 URL이 곧 상태예요. (새로고침·공유에도 유지)
  const filter = (searchParams.get("filter") ?? "all") as Filter;
  const search = searchParams.get("search") ?? "";

  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [searchInput, setSearchInput] = useState(search); // 검색창 즉시 반응용 로컬 입력값
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState(""); // 추가 입력값
  const [refreshKey, setRefreshKey] = useState(0); // 이 값을 올리면 목록을 다시 불러와요

  // 보고 있는 주(weekStart)는 selectedDate에서 "계산"해요. (파생 상태 — 2차 피드백 적용)
  // weekStart를 따로 state로 들지 않아서, 주와 선택날짜가 어긋날 일이 없어요.
  const weekStart = getWeekStart(fromISODate(selectedDate));
  const weekDates = getWeekDates(weekStart);
  const weekRange = `${toISODate(weekDates[0])} ~ ${toISODate(weekDates[6])}`;

  // 목록 조회: 상태 필터·검색을 쿼리로 넘겨 서버(FastAPI)에서 거른 결과를 받아와요.
  // filter/search/refreshKey가 바뀔 때마다 다시 불러와요.
  useEffect(() => {
    let active = true;
    (async () => {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("filter", filter);
      if (search) params.set("search", search);
      const res = await fetch(`${API_URL}/todos?${params.toString()}`, { cache: "no-store" });
      if (active && res.ok) setTodos(await res.json());
    })();
    return () => {
      active = false; // 응답이 늦게 와도 옛 요청 결과는 버려요.
    };
  }, [filter, search, refreshKey]);

  // 검색창에 타이핑하면 300ms 뒤에 URL(?search=)에 반영해요.
  // (글자마다 곧장 요청하면 너무 잦아서 잠깐 기다렸다가 한 번에 반영)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("filter", filter);
      if (searchInput.trim()) params.set("search", searchInput.trim());
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filter, pathname, router]);

  // 선택한 날짜의 할 일만 화면에 보여줘요. (날짜로 거르는 건 클라이언트에서)
  const todosOfDay = todos.filter((t) => t.date === selectedDate);
  const countOf = (d: Date) => todos.filter((t) => t.date === toISODate(d)).length;

  const reload = () => setRefreshKey((k) => k + 1);

  function changeFilter(f: Filter) {
    const params = new URLSearchParams();
    if (f !== "all") params.set("filter", f);
    if (search) params.set("search", search);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  // 이전/다음 주 = 선택한 날짜를 7일 옮기는 것. (주는 파생값이라 자동으로 따라와요)
  function moveWeek(delta: number) {
    const d = fromISODate(selectedDate);
    d.setDate(d.getDate() + delta * 7);
    setSelectedDate(toISODate(d));
  }

  async function add() {
    const title = input.trim();
    if (!title) return;
    // 새 할 일은 지금 선택한 날짜(selectedDate)에 만들어요.
    await fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date: selectedDate }),
    });
    setInput("");
    reload();
  }

  async function toggle(todo: Todo) {
    await fetch(`${API_URL}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    reload();
  }

  async function remove(id: number) {
    await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <main className="min-h-screen flex justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-center text-[#672be0] mb-6">할 일 목록</h1>

        {/* 주 이동 */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => moveWeek(-1)} className="text-[#672be0] px-2 hover:opacity-60">
            ◀
          </button>
          <span className="text-sm text-gray-400">{weekRange}</span>
          <button onClick={() => moveWeek(1)} className="text-[#672be0] px-2 hover:opacity-60">
            ▶
          </button>
        </div>

        {/* 요일 선택 (요일 / 날짜 / 그 날 개수) */}
        <div className="grid grid-cols-7 gap-1 mb-5">
          {weekDates.map((d, i) => {
            const iso = toISODate(d);
            const isSelected = iso === selectedDate;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={`flex flex-col items-center py-2 rounded-xl text-sm ${
                  isSelected ? "bg-[#672be0] text-white" : "bg-[#f1ecfb] text-[#672be0]"
                }`}
              >
                <span className="text-xs">{DAY_KO[i]}</span>
                <span className="font-bold leading-tight">{d.getDate()}</span>
                <span className="text-xs">{countOf(d)}</span>
              </button>
            );
          })}
        </div>

        {/* 추가 입력 */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && add()}
            placeholder="할 일을 입력하세요"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#672be0]"
          />
          <button
            onClick={add}
            className="bg-[#672be0] text-white text-sm rounded-lg px-4 hover:opacity-90"
          >
            추가
          </button>
        </div>

        {/* 검색 */}
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#672be0]"
        />

        {/* 상태 필터 */}
        <div className="flex gap-2 mb-5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => changeFilter(f.key)}
              className={`flex-1 text-sm rounded-lg py-2 ${
                filter === f.key ? "bg-[#672be0] text-white" : "bg-[#f1ecfb] text-[#672be0]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 목록 (선택한 날짜의 할 일) */}
        {todosOfDay.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">
            {search ? `"${search}" 검색 결과가 없어요.` : "이 날짜엔 할 일이 없어요. 추가해보세요!"}
          </p>
        ) : (
          <ul className="space-y-2">
            {todosOfDay.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 bg-[#faf8ff] border border-gray-100 rounded-lg px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggle(todo)}
                  className="w-4 h-4 accent-[#672be0]"
                />
                <span
                  className={`flex-1 text-sm ${
                    todo.completed ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {todo.title}
                </span>
                <Link href={`/todos/${todo.id}`} className="text-xs text-[#672be0] hover:underline">
                  수정
                </Link>
                <button
                  onClick={() => remove(todo.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
