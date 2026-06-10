// 1차 과제에서 쓰던 날짜 헬퍼들을 그대로 가져와 정리한 파일이에요.
// App / WeekStrip / DayNavigator 여러 곳에서 같은 함수를 쓰기 때문에 한 군데로 모았어요.

export const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

// toISOString()은 UTC 기준이라 저녁에 날짜가 하루 밀려요. 그래서 로컬 기준으로 직접 만들어요.
export function toKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// 월요일을 한 주의 시작으로 봐요. (일요일이면 6일 앞으로 당겨요)
export function getMonday(date) {
  const result = new Date(date);
  const gap = result.getDay() === 0 ? -6 : 1 - result.getDay();
  result.setDate(result.getDate() + gap);
  result.setHours(0, 0, 0, 0);
  return result;
}

// weekOffset(현재 주에서 몇 주 떨어졌는지)을 받아 그 주의 월~일 날짜 7개를 돌려줘요.
// baseDate를 인자로 받게 해서 "지금"에 의존하지 않게 했어요(테스트하기도 편해요).
export function getWeekDates(weekOffset, baseDate = new Date()) {
  const monday = getMonday(baseDate);
  monday.setDate(monday.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

// 특정 날짜(key)가 현재 주에서 몇 주 떨어진 주에 있는지 계산해요.
// 일간 뷰에서 날짜를 옮길 때, 주간 뷰도 그 날짜가 있는 주로 따라가게 하려고 만들었어요.
export function getWeekOffsetOf(key, baseDate = new Date()) {
  const base = getMonday(baseDate);
  const target = getMonday(fromKey(key));
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  return Math.round((target - base) / MS_PER_WEEK);
}
