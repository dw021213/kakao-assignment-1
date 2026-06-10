import { useEffect, useState } from "react";
import { toKey, fromKey, getWeekOffsetOf } from "./utils/date";
import WeekStrip from "./components/WeekStrip";
import DayNavigator from "./components/DayNavigator";
import TodoInput from "./components/TodoInput";
import FilterTabs from "./components/FilterTabs";
import TodoList from "./components/TodoList";

const STORAGE_KEY = "kakao-daily-todo";

// 함수형 초기화로 딱 한 번만 localStorage를 읽어요.
// (그냥 useState(JSON.parse(...))로 쓰면 리렌더링마다 파싱이 또 돌아요)
// JSON이 깨졌을 때만 try/catch로 막고, 값 모양은 배열/숫자 정도만 가볍게 확인해요.
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { tasks: [], weekOffset: 0 };
    const parsed = JSON.parse(saved);
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    const weekOffset = Number.isInteger(parsed.weekOffset) ? parsed.weekOffset : 0;
    return { tasks, weekOffset };
  } catch {
    // 저장된 값이 깨졌어도 앱이 죽지 않게 빈 상태로 시작해요.
    return { tasks: [], weekOffset: 0 };
  }
}

export default function App() {
  // loadState를 두 번 부르지 않게, 한 번 읽어서 tasks/weekOffset 초기값으로 나눠 써요.
  const [initial] = useState(loadState);
  const [tasks, setTasks] = useState(initial.tasks);
  const [weekOffset, setWeekOffset] = useState(initial.weekOffset);
  // 선택한 날짜는 항상 "오늘"로 열어요. (날짜 키 문자열로 들고 있어요)
  const [selectedDate, setSelectedDate] = useState(() => toKey(new Date()));
  const [activeFilter, setActiveFilter] = useState("all");

  // tasks나 weekOffset이 바뀔 때마다 자동으로 저장해요. (1차 과제처럼 함수마다 부르지 않아요)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, weekOffset }));
  }, [tasks, weekOffset]);

  function addTask(title) {
    // id는 updater 바깥에서 한 번만 만들어요.
    // (StrictMode는 개발 중 updater를 두 번 호출해서, 안에 두면 Date.now()가 두 번 불려요)
    const newTask = { id: Date.now(), title, done: false, date: selectedDate };
    setTasks((prev) => [...prev, newTask]);
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  }

  function editTask(id, newTitle) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, title: newTitle } : task))
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  // 이전/다음이 delta(-1/+1)만 다르고 로직은 같아서, delta를 기억하는 클로저로 핸들러를 찍어내요.
  // moveWeek(-1)을 부르면 "delta가 -1로 고정된 함수"가 만들어져서 버튼 onClick에 바로 꽂혀요.
  const moveWeek = (delta) => () => setWeekOffset((prev) => prev + delta);

  // 일간 이동도 같은 방식. 다만 날짜를 옮겨 주 경계를 넘으면 주간 뷰도 그 주로 따라가게 해요.
  const moveDay = (delta) => () => {
    const next = fromKey(selectedDate);
    next.setDate(next.getDate() + delta);
    const nextKey = toKey(next);
    setSelectedDate(nextKey);
    setWeekOffset(getWeekOffsetOf(nextKey));
  };

  const visibleTasks = tasks.filter((task) => {
    if (task.date !== selectedDate) return false;
    if (activeFilter === "active") return !task.done;
    if (activeFilter === "done") return task.done;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f6f6fb] flex justify-center items-start px-4 py-12">
      <main className="w-[440px] max-w-full bg-white rounded-2xl shadow-[0_12px_40px_rgba(103,43,224,0.1)] p-7">
        <header className="mb-5">
          <h1 className="text-2xl font-bold text-[#672be0]">Daily Todo</h1>
          <p className="mt-1 text-[13px] text-gray-400">하루 단위로 할 일을 정리해요</p>
        </header>

        <WeekStrip
          tasks={tasks}
          weekOffset={weekOffset}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPrevWeek={moveWeek(-1)}
          onNextWeek={moveWeek(1)}
        />

        <DayNavigator
          selectedDate={selectedDate}
          onPrevDay={moveDay(-1)}
          onNextDay={moveDay(1)}
        />

        <TodoInput onAdd={addTask} />

        <FilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

        <TodoList
          tasks={visibleTasks}
          onToggle={toggleTask}
          onEdit={editTask}
          onDelete={deleteTask}
        />
      </main>
    </div>
  );
}
