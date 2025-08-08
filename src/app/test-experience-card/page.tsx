'use client';

import ExperienceCard from '@/components/ExperienceCard';

export default function TestExperienceCardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">ExperienceCard Component Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ExperienceCard
          id="1"
          image="/images/placeholder.jpg"
          imageAlt="서울 야경 투어"
          title="서울 야경 투어 - N서울타워와 한강 크루즈"
          rating={4.5}
          reviewCount={1234}
          price={89000}
          currency="₩"
          tags={['베스트셀러', '즉시확정', '무료취소']}
          badge="20% 할인"
        />
        
        <ExperienceCard
          id="2"
          image="/images/placeholder.jpg"
          imageAlt="제주도 투어"
          title="제주도 동부 UNESCO 세계자연유산 일일 투어 - 성산일출봉, 만장굴, 비자림 포함"
          rating={5}
          reviewCount={567}
          price={125000}
          currency="₩"
          tags={['프리미엄', '소그룹']}
          isSaved={true}
        />
        
        <ExperienceCard
          id="3"
          image="/images/placeholder.jpg"
          imageAlt="부산 투어"
          title="부산 감천문화마을 & 해동용궁사 투어"
          rating={3.5}
          reviewCount={89}
          price={65000}
          currency="₩"
          tags={['당일투어']}
        />
      </div>
    </div>
  );
}