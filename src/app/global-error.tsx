'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              시스템 오류가 발생했습니다
            </h2>
            <p className="text-gray-600 mb-4">
              예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            {error.digest && (
              <p className="text-sm text-gray-500 mb-4">
                오류 코드: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}