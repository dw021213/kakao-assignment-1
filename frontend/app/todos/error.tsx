"use client";

// 페이지에서 에러가 나면(예: 백엔드가 꺼져 있어 fetch 실패) 이 화면이 대신 보여요.
// error.tsx는 반드시 Client Component여야 하고, 다시 시도하는 reset 함수를 받아요.
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <p className="text-sm text-gray-600">문제가 생겼어요: {error.message}</p>
      <button
        onClick={reset}
        className="bg-[#672be0] text-white text-sm rounded-lg px-4 py-2 hover:opacity-90"
      >
        다시 시도
      </button>
    </main>
  );
}
