import { WEEKDAY, toKey, getWeekDates } from "../utils/date";

export default function WeekStrip({
  tasks,
  weekOffset,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}) {
  const weekDates = getWeekDates(weekOffset);
  const todayKey = toKey(new Date());

  // 날짜별 할 일 개수를 한 번만 세어 두고 칸마다 꺼내 써요.
  // (7칸마다 tasks.filter를 다시 돌리는 대신 객체 한 번으로 끝내요)
  const countByDate = tasks.reduce((acc, task) => {
    acc[task.date] = (acc[task.date] ?? 0) + 1;
    return acc;
  }, {});

  const first = weekDates[0];
  const last = weekDates[6];
  const weekLabel = `${first.getMonth() + 1}월 ${first.getDate()}일 - ${last.getMonth() + 1}월 ${last.getDate()}일`;

  return (
    <section className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onPrevWeek}
          aria-label="이전 주"
          className="w-8 h-8 rounded-lg bg-[#f1ecff] text-[#672be0] text-lg leading-none hover:bg-[#e6dcff]"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-[#672be0]">{weekLabel}</span>
        <button
          onClick={onNextWeek}
          aria-label="다음 주"
          className="w-8 h-8 rounded-lg bg-[#f1ecff] text-[#672be0] text-lg leading-none hover:bg-[#e6dcff]"
        >
          ›
        </button>
      </div>

      <ul className="grid grid-cols-7 gap-1.5">
        {weekDates.map((date) => {
          const key = toKey(date);
          const count = countByDate[key] ?? 0;
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;

          return (
            <li key={key}>
              <button
                onClick={() => onSelectDate(key)}
                className="w-full flex flex-col items-center gap-1 py-1 cursor-pointer"
              >
                <span className="text-xs text-gray-400">{WEEKDAY[date.getDay()]}</span>
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold ${
                    isSelected
                      ? "bg-[#672be0] text-white"
                      : isToday
                      ? "border-[1.5px] border-[#672be0] text-[#672be0]"
                      : "text-gray-700"
                  }`}
                >
                  {date.getDate()}
                </span>
                <span
                  className={`inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-lg text-[10px] ${
                    count > 0 ? "bg-[#f1ecff] text-[#672be0]" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
