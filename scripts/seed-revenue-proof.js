/**
 * 수익 인증 시드 데이터 추가 스크립트
 * 사용법: node scripts/seed-revenue-proof.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.log('필요한 환경 변수:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (또는 NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 시드 데이터
const seedData = [
  {
    title: '2025년 5월 YouTube Shorts 수익 인증',
    content: '<p>안녕하세요! 5월 YouTube Shorts 수익을 인증합니다.</p><p>이번 달은 특히 바이럴된 영상이 많아서 수익이 크게 늘었습니다. 주로 일상 브이로그와 먹방 콘텐츠를 제작했고, 하루 평균 3-4개의 쇼츠를 업로드했습니다.</p><p>꾸준함이 가장 중요한 것 같습니다. 매일 업로드하는 것이 힘들 때도 있지만, 구독자분들의 응원 덕분에 계속할 수 있었습니다.</p><p><strong>핵심 팁:</strong></p><ul><li>트렌드를 빠르게 캐치하기</li><li>썸네일과 제목 최적화</li><li>첫 3초가 가장 중요</li><li>댓글 소통 적극적으로</li></ul>',
    amount: 2850000,
    platform: 'youtube',
    screenshot_url: '/images/revenue-proof/20250514_155618.png',
    signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  },
  {
    title: '2025년 7월 인스타그램 릴스 광고 수익',
    content: '<p>인스타그램 릴스로 처음 100만원을 돌파했습니다! 🎉</p><p>패션 하울과 메이크업 튜토리얼 콘텐츠를 주로 제작했고, 브랜드 협찬도 3건 받았습니다.</p><p>릴스는 YouTube Shorts와 다르게 스토리텔링이 더 중요한 것 같아요. 음악 선택도 정말 중요하고, 해시태그 전략도 필수입니다.</p><p><strong>성공 전략:</strong></p><ul><li>인기 음원 활용하기</li><li>릴스 전용 편집 스타일 개발</li><li>스토리에서 릴스로 유도</li><li>협찬 제품 자연스럽게 녹이기</li></ul>',
    amount: 1250000,
    platform: 'instagram',
    screenshot_url: '/images/revenue-proof/20250713_195132.png',
    signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  },
  {
    title: 'TikTok 크리에이터 펀드 첫 정산',
    content: '<p>드디어 TikTok에서도 수익이 발생했습니다!</p><p>댄스 챌린지와 코미디 콘텐츠로 팔로워 10만을 달성하고, 크리에이터 펀드에 가입했습니다.</p><p>TikTok은 알고리즘이 정말 강력해서 하나가 터지면 순식간에 조회수가 올라가더라구요. 대신 일관성 있는 콘텐츠가 중요합니다.</p><p><strong>TikTok 팁:</strong></p><ul><li>트렌드 사운드는 필수</li><li>첫 1초에 훅 넣기</li><li>세로 화면 최적화</li><li>라이브 방송도 병행하기</li></ul>',
    amount: 780000,
    platform: 'tiktok',
    screenshot_url: '/images/revenue-proof/IMG_2157.png',
    signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  },
  {
    title: '6월 YouTube 최고 수익 달성!',
    content: '<p>믿기지 않지만 6월에 역대 최고 수익을 달성했습니다! 😱</p><p>게임 플레이 쇼츠가 대박이 났어요. 특히 신작 게임 공략 영상들이 조회수 100만을 넘었습니다.</p><p>이번에 깨달은 건 타이밍이 정말 중요하다는 것. 신작 게임 출시 직후가 골든타임입니다.</p><p><strong>게임 쇼츠 전략:</strong></p><ul><li>신작 게임 출시일 체크</li><li>핵심 장면만 편집</li><li>공략 정보는 자막으로</li><li>시리즈물로 연결하기</li></ul><p>다음 달도 이 기세를 이어가고 싶네요! 화이팅! 💪</p>',
    amount: 4200000,
    platform: 'youtube',
    screenshot_url: '/images/revenue-proof/KakaoTalk_20250618_054750921_01.png',
    signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  },
  {
    title: '인스타그램 + YouTube 동시 운영 수익',
    content: '<p>멀티 플랫폼 전략이 성공했습니다!</p><p>같은 콘텐츠를 플랫폼별로 최적화해서 업로드하니 수익이 2배가 되었어요. 요리 레시피 콘텐츠인데, YouTube는 자세한 과정을, 인스타는 결과물 위주로 편집했습니다.</p><p><strong>멀티 플랫폼 운영 팁:</strong></p><ul><li>각 플랫폼 특성 이해하기</li><li>콘텐츠 재활용 전략</li><li>업로드 시간대 다르게</li><li>플랫폼별 소통 방식 차별화</li></ul><p>시간 관리가 힘들긴 하지만, 수익이 안정적으로 들어와서 만족스럽습니다.</p>',
    amount: 1850000,
    platform: 'youtube',
    screenshot_url: '/images/revenue-proof/image (2).png',
    signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  },
  {
    title: '8월 TikTok 라이브 수익 공개',
    content: '<p>TikTok 라이브 방송으로만 150만원 달성!</p><p>매일 저녁 2시간씩 라이브를 진행했고, 주로 시청자들과 소통하면서 노래를 불렀습니다. 선물 기능이 활성화되면서 수익이 크게 늘었어요.</p><p><strong>라이브 방송 노하우:</strong></p><ul><li>정해진 시간에 꾸준히</li><li>시청자 닉네임 부르기</li><li>즉석 이벤트 자주하기</li><li>다른 크리에이터와 콜라보</li></ul><p>라이브는 정말 체력전이지만, 팬들과 직접 소통할 수 있어서 좋아요!</p>',
    amount: 1500000,
    platform: 'tiktok',
    screenshot_url: '/images/revenue-proof/스크린샷_2025-08-03_141501.png',
    signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  },
];

async function seedRevenueProofs() {
  try {
    console.log('🚀 수익 인증 시드 데이터 추가 시작...');

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('⚠️  인증된 사용자가 없습니다. 로그인 후 다시 시도하세요.');
      console.log('또는 Supabase Dashboard에서 직접 SQL을 실행하세요:');
      console.log('파일 위치: src/lib/supabase/seeds/revenue-proof-seed.sql');
      return;
    }

    console.log(`✅ 사용자 확인: ${user.email}`);

    // 각 시드 데이터 추가
    for (const [index, data] of seedData.entries()) {
      const { data: result, error } = await supabase
        .from('revenue_proofs')
        .insert({
          user_id: user.id,
          ...data,
          screenshot_blur: '',
          is_hidden: false,
          likes_count: Math.floor(Math.random() * 100) + 10,
          comments_count: Math.floor(Math.random() * 30) + 5,
          reports_count: 0,
          created_at: new Date(Date.now() - (index * 2 * 24 * 60 * 60 * 1000)).toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ 데이터 ${index + 1} 추가 실패:`, error.message);
      } else {
        console.log(`✅ 데이터 ${index + 1} 추가 성공: ${data.title}`);
      }
    }

    console.log('🎉 시드 데이터 추가 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 스크립트 실행
seedRevenueProofs();