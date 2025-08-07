import { HeroSection } from '@/components/sections/HeroSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      
      {/* Social Proof Section */}
      <section className="py-20 bg-bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <p className="text-2xl font-semibold text-primary mb-8">
            N사 공식 카페 회원 <span className="text-accent">10,000명</span>이 함께합니다
          </p>
          <div className="flex justify-center gap-8 opacity-60">
            {/* Community logos placeholder */}
            <div className="w-32 h-12 bg-white/10 rounded-lg"></div>
            <div className="w-32 h-12 bg-white/10 rounded-lg"></div>
            <div className="w-32 h-12 bg-white/10 rounded-lg"></div>
          </div>
        </div>
      </section>

      {/* Features Section - will be implemented in Task 2 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              크리에이터를 위한 완벽한 도구
            </h2>
            <p className="text-lg text-primary/60">
              AI 기술로 당신의 창작 시간을 절약하세요
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
