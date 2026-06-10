import TodoItem from "./TodoItem";

export default function TodoList({ tasks, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <p className="text-center text-[13px] text-gray-400 py-7">
        이 날에는 할 일이 없어요.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[#ececf2]">
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
