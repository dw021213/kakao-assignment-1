const FILTERS = [
  { label: "전체", value: "all" },
  { label: "진행 중", value: "active" },
  { label: "완료", value: "done" },
];

export default function FilterTabs({ activeFilter, onChange }) {
  return (
    <nav className="flex gap-1.5 mb-3.5">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`flex-1 py-1.5 rounded-lg text-[13px] ${
              isActive ? "bg-[#672be0] text-white" : "bg-[#f0f0f5] text-gray-400 hover:bg-[#e9e9f2]"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </nav>
  );
}
