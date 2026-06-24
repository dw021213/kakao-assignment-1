import { notFound } from "next/navigation";
import { getTodo } from "../../actions";
import EditTodoForm from "./components/EditTodoForm";

// 수정 페이지는 Server Component예요.
// 서버에서 해당 Todo 하나를 먼저 불러오고, 입력 폼(인터랙션)은 Client Component에 맡겨요.
// Next.js 16에서 params는 Promise라서 await로 꺼내요.
export default async function EditTodoPage({
  params,
}: {
  params: Promise<{ todoId: string }>;
}) {
  const { todoId } = await params;
  const todo = await getTodo(todoId);

  // 없는 id로 들어오면 404 화면을 보여줘요.
  if (!todo) {
    notFound();
  }

  return (
    <main className="min-h-screen flex justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#672be0] mb-6">할 일 수정</h1>
        <EditTodoForm todo={todo} />
      </div>
    </main>
  );
}
