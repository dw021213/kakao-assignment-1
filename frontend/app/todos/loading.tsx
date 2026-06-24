// 목록 데이터를 불러오는 동안 자동으로 보여지는 화면이에요.
// (page.tsx가 서버에서 데이터를 가져오는 시간 동안 Next.js가 대신 띄워줘요)
export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-400">불러오는 중...</p>
    </main>
  );
}
