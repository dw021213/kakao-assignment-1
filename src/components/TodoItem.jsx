import { useState } from "react";

export default function TodoItem({ task, onToggle, onEdit, onDelete }) {
  // 1차 과제에서 prompt()로 띄우던 수정창을, 여기서는 isEditing 상태로 바꿔요.
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.title);

  function startEdit() {
    setEditText(task.title);
    setIsEditing(true);
  }

  function confirmEdit() {
    const trimmed = editText.trim();
    // 빈 값이면 수정하지 않고 원래 내용으로 되돌려요.
    if (trimmed !== "") onEdit(task.id, trimmed);
    setIsEditing(false);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  // 입력창과 똑같이, 한글 조합 중 엔터는 막아요. (e.nativeEvent에서 isComposing을 봐야 해요)
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) confirmEdit();
    if (e.key === "Escape") cancelEdit();
  }

  if (isEditing) {
    return (
      <li className="flex items-center gap-2 py-2.5">
        <input
          autoFocus
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={80}
          className="flex-1 px-3 py-1.5 rounded-lg border border-[#672be0] text-sm outline-none"
        />
        <button
          onClick={confirmEdit}
          className="px-2.5 py-1 text-xs rounded-md text-[#672be0] hover:bg-[#f1ecff]"
        >
          확인
        </button>
        <button
          onClick={cancelEdit}
          className="px-2.5 py-1 text-xs rounded-md text-gray-400 hover:bg-[#f0f0f5]"
        >
          취소
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2.5 py-2.5">
      <span
        className={`flex-1 text-sm break-all ${
          task.done ? "line-through text-gray-400" : "text-gray-800"
        }`}
      >
        {task.title}
      </span>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onToggle(task.id)}
          className="px-1.5 py-1 text-xs rounded-md text-gray-400 hover:bg-[#f0f0f5] hover:text-gray-800"
        >
          {task.done ? "되돌리기" : "완료"}
        </button>
        <button
          onClick={startEdit}
          className="px-1.5 py-1 text-xs rounded-md text-gray-400 hover:bg-[#f0f0f5] hover:text-gray-800"
        >
          수정
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="px-1.5 py-1 text-xs rounded-md text-gray-400 hover:bg-[#f0f0f5] hover:text-gray-800"
        >
          삭제
        </button>
      </div>
    </li>
  );
}
