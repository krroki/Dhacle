import Link from 'next/link';

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">
          크리에이터 도구 모음
        </h1>
        <p className="text-xl text-primary/60 mb-12">
          YouTube Shorts 제작을 위한 강력한 AI 도구들을 무료로 사용해보세요.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI Subtitle Generator */}
          <Link href="/tools/transcribe">
            <div className="group relative bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-accent/50 transition-all cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  AI 자막 생성기
                </h3>
                <p className="text-primary/60 mb-4">
                  오디오/비디오 파일을 업로드하면 AI가 자동으로 정확한 한국어 자막을 생성합니다.
                </p>
                <div className="flex items-center text-accent">
                  <span className="text-sm font-medium">지금 사용하기</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Coming Soon Tools */}
          <div className="relative bg-white/5 border border-white/10 rounded-xl p-6 opacity-50">
            <div className="absolute top-4 right-4 bg-accent/20 text-accent text-xs font-semibold px-2 py-1 rounded">
              COMING SOON
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              썸네일 생성기
            </h3>
            <p className="text-primary/60">
              AI가 시선을 사로잡는 YouTube Shorts 썸네일을 자동으로 생성합니다.
            </p>
          </div>

          <div className="relative bg-white/5 border border-white/10 rounded-xl p-6 opacity-50">
            <div className="absolute top-4 right-4 bg-accent/20 text-accent text-xs font-semibold px-2 py-1 rounded">
              COMING SOON
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              BGM 추천기
            </h3>
            <p className="text-primary/60">
              콘텐츠 분위기에 맞는 완벽한 배경음악을 AI가 추천해드립니다.
            </p>
          </div>

          <div className="relative bg-white/5 border border-white/10 rounded-xl p-6 opacity-50">
            <div className="absolute top-4 right-4 bg-accent/20 text-accent text-xs font-semibold px-2 py-1 rounded">
              COMING SOON
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              해시태그 분석기
            </h3>
            <p className="text-primary/60">
              트렌드 해시태그를 분석하고 최적의 태그를 추천합니다.
            </p>
          </div>

          <div className="relative bg-white/5 border border-white/10 rounded-xl p-6 opacity-50">
            <div className="absolute top-4 right-4 bg-accent/20 text-accent text-xs font-semibold px-2 py-1 rounded">
              COMING SOON
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              콘텐츠 아이디어
            </h3>
            <p className="text-primary/60">
              AI가 트렌드를 분석하여 바이럴 콘텐츠 아이디어를 제안합니다.
            </p>
          </div>

          <div className="relative bg-white/5 border border-white/10 rounded-xl p-6 opacity-50">
            <div className="absolute top-4 right-4 bg-accent/20 text-accent text-xs font-semibold px-2 py-1 rounded">
              COMING SOON
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              분석 대시보드
            </h3>
            <p className="text-primary/60">
              채널 성과를 한눈에 파악하고 개선점을 찾아드립니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}