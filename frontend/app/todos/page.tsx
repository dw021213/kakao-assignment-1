import { Suspense } from "react";
import TodoBoard from "./components/TodoBoard";

// 목록 페이지는 주간 보드(인터랙션 덩어리)를 감싸는 얇은 Server Component예요.
// 보드가 useSearchParams를 쓰기 때문에 Suspense로 감싸요. (Next.js 요구사항)
export default function TodosPage() {
  return (
    <Suspense>
      <TodoBoard />
    </Suspense>
  );
}
