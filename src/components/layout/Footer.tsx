import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">쇼츠 스튜디오</h3>
            <p className="text-sm text-primary/60">
              AI로 쇼츠 제작을 더 쉽고 빠르게
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-4">제품</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tools" className="text-sm text-primary/60 hover:text-primary transition-colors">
                  자막 생성기
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-sm text-primary/60 hover:text-primary transition-colors">
                  AI 도구
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-4">자료실</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/resources" className="text-sm text-primary/60 hover:text-primary transition-colors">
                  E-book
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-sm text-primary/60 hover:text-primary transition-colors">
                  가이드
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-4">커뮤니티</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/community" className="text-sm text-primary/60 hover:text-primary transition-colors">
                  오픈 채팅방
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-primary/60 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-center text-sm text-primary/40">
            © 2024 쇼츠 스튜디오. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}