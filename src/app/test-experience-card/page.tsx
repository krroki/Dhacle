'use client';

import ExperienceCard from '@/components/ExperienceCard';
import { useState } from 'react';

const testData = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    imageAlt: '서울 야경 투어',
    title: '서울 야경 투어 - N서울타워와 한강 크루즈',
    rating: 4.8,
    reviewCount: 324,
    price: 89000,
    currency: '₩',
    tags: ['베스트셀러', '소그룹', '당일투어'],
    badge: 'BEST',
    isSaved: false
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80',
    imageAlt: '부산 감천문화마을',
    title: '부산 감천문화마을 & 해동용궁사 일일 투어',
    rating: 4.6,
    reviewCount: 567,
    price: 125000,
    currency: '₩',
    tags: ['인기', '포토스팟'],
    isSaved: true
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&q=80',
    imageAlt: '경주 역사 탐방',
    title: '경주 UNESCO 세계유산 일일 투어 - 불국사, 석굴암, 첨성대',
    rating: 4.9,
    reviewCount: 892,
    price: 65000,
    currency: '₩',
    tags: ['문화탐방', '역사'],
    badge: 'NEW',
    isSaved: false
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80',
    imageAlt: '제주도 올레길',
    title: '제주도 올레길 트래킹 & 맛집 투어',
    rating: 4.7,
    reviewCount: 445,
    price: 135000,
    currency: '₩',
    tags: ['자연', '힐링'],
    isSaved: false
  }
];

export default function TestExperienceCardPage() {
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set(['2']));
  
  const handleSave = (id: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    console.log('Saved:', id);
  };

  const handleClick = (id: string) => {
    console.log('Clicked:', id);
  };

  return (
    <div style={{ 
      padding: '40px 20px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#111827'
        }}>
          ExperienceCard Component Test
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          marginBottom: '40px'
        }}>
          Visual Verification Protocol (VVP) 검증용 테스트 페이지
        </p>
        
        {/* 단일 카드 테스트 */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            color: '#374151'
          }}>
            단일 카드 테스트
          </h2>
          <div style={{ maxWidth: '400px' }}>
            <ExperienceCard 
              {...testData[0]} 
              isSaved={savedItems.has(testData[0].id)}
              onSave={handleSave}
              onClick={handleClick}
            />
          </div>
        </section>
        
        {/* 그리드 레이아웃 테스트 */}
        <section>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            color: '#374151'
          }}>
            그리드 레이아웃 테스트
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {testData.map(item => (
              <ExperienceCard 
                key={item.id}
                {...item}
                isSaved={savedItems.has(item.id)}
                onSave={handleSave}
                onClick={handleClick}
              />
            ))}
          </div>
        </section>

        {/* 반응형 테스트 안내 */}
        <section style={{ 
          marginTop: '60px',
          padding: '24px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#374151'
          }}>
            반응형 테스트 체크포인트
          </h3>
          <ul style={{ color: '#6b7280', lineHeight: '1.8' }}>
            <li>✅ 모바일 (375px): 카드가 세로로 정렬</li>
            <li>✅ 태블릿 (768px): 2열 그리드</li>
            <li>✅ 데스크톱 (1200px+): 3-4열 그리드</li>
            <li>✅ 호버 효과: 카드 확대 및 그림자 증가</li>
            <li>✅ 저장 버튼: 하트 아이콘 색상 변경</li>
          </ul>
        </section>
      </div>
    </div>
  );
}