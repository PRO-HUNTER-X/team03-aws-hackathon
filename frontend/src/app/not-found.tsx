import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <div className="mb-8">
          <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">404</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/inquiry"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}