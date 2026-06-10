import { WEEKDAY, toKey, fromKey } from "../utils/date";

export default function DayNavigator({ selectedDate, onPrevDay, onNextDay }) {
  const date = fromKey(selectedDate);
  const isToday = selectedDate === toKey(new Date());
  const label = `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY[date.getDay()]})${isToday ? " · 오늘" : ""}`;

  return (
    <section className="flex items-center justify-between mt-2 mb-4">
      <button
        onClick={onPrevDay}
        aria-label="이전 날짜"
        className="w-8 h-8 rounded-lg bg-[#f1ecff] text-[#672be0] text-lg leading-none hover:bg-[#e6dcff]"
      >
        ‹
      </button>
      <span className="text-[15px] font-semibold text-gray-800">{label}</span>
      <button
        onClick={onNextDay}
        aria-label="다음 날짜"
        className="w-8 h-8 rounded-lg bg-[#f1ecff] text-[#672be0] text-lg leading-none hover:bg-[#e6dcff]"
      >
        ›
      </button>
    </section>
  );
}
