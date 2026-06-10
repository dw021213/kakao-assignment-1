import { useState } from "react";

export default function TodoInput({ onAdd }) {
  const [text, setText] = useState("");
  const [warning, setWarning] = useState("");

  function handleAdd() {
    const trimmed = text.trim();
    if (trimmed === "") {
      setWarning("할 일을 입력해 주세요.");
      return;
    }
    setWarning("");
    onAdd(trimmed);
    setText("");
  }

  // 1차 과제에서 겪었던 한글 버그 그대로예요.
  // 조합 중(isComposing)에 들어온 엔터는 글자만 확정하고, 실제 추가는 막아요.
  // 주의: React 합성 이벤트(e)에는 isComposing이 없어서 e.nativeEvent에서 꺼내야 해요.
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) handleAdd();
  }

  return (
    <div className="mb-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="할 일을 입력하세요"
          maxLength={80}
          className="flex-1 px-3 py-2.5 rounded-xl border border-[#ececf2] text-sm outline-none focus:border-[#672be0]"
        />
        <button
          onClick={handleAdd}
          className="px-4 rounded-xl bg-[#672be0] text-white text-sm hover:bg-[#5a23c9]"
        >
          추가
        </button>
      </div>
      <p className="min-h-4 mt-1.5 px-0.5 text-xs text-[#e0405b]">{warning}</p>
    </div>
  );
}
