const STORAGE_KEY = "kakao-daily-todo";
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const warning = document.getElementById("warning");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const weekStrip = document.getElementById("weekStrip");
const weekLabel = document.getElementById("weekLabel");
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");
const selectedLabel = document.getElementById("selectedLabel");
const prevDayBtn = document.getElementById("prevDay");
const nextDayBtn = document.getElementById("nextDay");
const filterButtons = document.querySelectorAll(".filter");

let tasks = [];
let selectedDate = toKey(new Date());
let weekAnchor = new Date();
let activeFilter = "all";

// toISOString은 UTC 기준이라 저녁에 날짜가 하루 밀린다. 그래서 로컬 기준으로 직접 만든다.
function toKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// 월요일을 한 주의 시작으로 본다. (일요일이면 6일 앞으로 당김)
function getMonday(date) {
  const result = new Date(date);
  const gap = result.getDay() === 0 ? -6 : 1 - result.getDay();
  result.setDate(result.getDate() + gap);
  return result;
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  tasks = data ? JSON.parse(data) : [];
}

function addTask() {
  const text = taskInput.value.trim();
  if (text === "") {
    warning.textContent = "할 일을 입력해 주세요.";
    return;
  }
  warning.textContent = "";

  tasks.push({
    id: Date.now(),
    title: text,
    done: false,
    date: selectedDate,
  });

  taskInput.value = "";
  saveTasks();
  renderAll();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  task.done = !task.done;
  saveTasks();
  renderAll();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  const newText = prompt("할 일을 수정하세요", task.title);
  if (newText !== null && newText.trim() !== "") {
    task.title = newText.trim();
    saveTasks();
    renderAll();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderAll();
}

function getVisibleTasks() {
  return tasks.filter((task) => {
    if (task.date !== selectedDate) return false;
    if (activeFilter === "active") return !task.done;
    if (activeFilter === "done") return task.done;
    return true;
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  const visible = getVisibleTasks();
  emptyState.hidden = visible.length > 0;

  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task";
    if (task.done) li.classList.add("done");

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const doneBtn = document.createElement("button");
    doneBtn.textContent = task.done ? "되돌리기" : "완료";
    doneBtn.onclick = () => toggleTask(task.id);

    const editBtn = document.createElement("button");
    editBtn.textContent = "수정";
    editBtn.onclick = () => editTask(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";
    deleteBtn.onclick = () => deleteTask(task.id);

    actions.append(doneBtn, editBtn, deleteBtn);
    li.append(title, actions);
    taskList.appendChild(li);
  });
}

function renderWeek() {
  weekStrip.innerHTML = "";
  const monday = getMonday(weekAnchor);
  const todayKey = toKey(new Date());

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push(date);
  }

  const first = days[0];
  const last = days[6];
  weekLabel.textContent =
    `${first.getMonth() + 1}월 ${first.getDate()}일 - ${last.getMonth() + 1}월 ${last.getDate()}일`;

  days.forEach((date) => {
    const key = toKey(date);
    const count = tasks.filter((t) => t.date === key).length;

    const cell = document.createElement("li");
    cell.className = "day-cell";
    if (key === todayKey) cell.classList.add("today");
    if (key === selectedDate) cell.classList.add("selected");

    const dow = document.createElement("span");
    dow.className = "dow";
    dow.textContent = WEEKDAY[date.getDay()];

    const dom = document.createElement("span");
    dom.className = "dom";
    dom.textContent = date.getDate();

    const badge = document.createElement("span");
    badge.className = count > 0 ? "badge" : "badge empty";
    badge.textContent = count;

    cell.append(dow, dom, badge);
    cell.onclick = () => {
      selectedDate = key;
      renderAll();
    };

    weekStrip.appendChild(cell);
  });
}

function renderSelectedLabel() {
  const date = fromKey(selectedDate);
  const suffix = selectedDate === toKey(new Date()) ? " · 오늘" : "";
  selectedLabel.textContent =
    `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY[date.getDay()]})${suffix}`;
}

function renderAll() {
  renderWeek();
  renderSelectedLabel();
  renderTasks();
}

function moveDay(offset) {
  const date = fromKey(selectedDate);
  date.setDate(date.getDate() + offset);
  selectedDate = toKey(date);
  weekAnchor = date;
  renderAll();
}

function moveWeek(offset) {
  weekAnchor.setDate(weekAnchor.getDate() + offset * 7);
  renderWeek();
}

addBtn.onclick = addTask;
// 한글 조합 중(isComposing)에 엔터를 치면 마지막 글자가 중복으로 추가돼서 막는다.
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.isComposing) addTask();
});

prevDayBtn.onclick = () => moveDay(-1);
nextDayBtn.onclick = () => moveDay(1);
prevWeekBtn.onclick = () => moveWeek(-1);
nextWeekBtn.onclick = () => moveWeek(1);

filterButtons.forEach((button) => {
  button.onclick = () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    renderTasks();
  };
});

loadTasks();
renderAll();
