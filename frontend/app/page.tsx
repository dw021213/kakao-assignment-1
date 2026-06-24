import { redirect } from "next/navigation";

// 루트(/)로 들어오면 곧바로 Todo 목록 페이지로 보내요.
export default function Home() {
  redirect("/todos");
}
