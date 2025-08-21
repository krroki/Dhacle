import { HttpResponse, http } from 'msw';

/**
 * MSW Request Handlers
 * 개발 중 API 모킹을 위한 핸들러 정의
 */
export const handlers = [
  // ========== YouTube Lens API Mocks ==========
  http.get('/api/youtube/popular', () => {
    return HttpResponse.json({
      videos: [
        {
          id: 'mock_video_1',
          title: '인기 쇼츠 테스트 #1',
          channel_title: '테스트 채널',
          view_count: '1234567',
          like_count: '98765',
          published_at: new Date().toISOString(),
          thumbnails: {
            default: { url: 'https://i.ytimg.com/vi/mock1/default.jpg' },
            medium: { url: 'https://i.ytimg.com/vi/mock1/mqdefault.jpg' },
            high: { url: 'https://i.ytimg.com/vi/mock1/hqdefault.jpg' },
          },
        },
        {
          id: 'mock_video_2',
          title: '인기 쇼츠 테스트 #2',
          channel_title: '샘플 채널',
          view_count: '2345678',
          like_count: '87654',
          published_at: new Date().toISOString(),
          thumbnails: {
            default: { url: 'https://i.ytimg.com/vi/mock2/default.jpg' },
            medium: { url: 'https://i.ytimg.com/vi/mock2/mqdefault.jpg' },
            high: { url: 'https://i.ytimg.com/vi/mock2/hqdefault.jpg' },
          },
        },
      ],
      nextPageToken: 'mockNextPageToken',
    });
  }),

  http.get('/api/youtube/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    return HttpResponse.json({
      videos: [
        {
          id: 'search_result_1',
          title: `검색 결과: ${query}`,
          channel_title: '검색 테스트 채널',
          view_count: '123456',
          description: `"${query}"에 대한 검색 결과입니다.`,
        },
      ],
      totalResults: 1,
    });
  }),

  http.get('/api/youtube/collections', () => {
    return HttpResponse.json([
      {
        id: 'mock_collection_1',
        name: '트렌드 분석 컬렉션',
        description: '최신 트렌드 비디오 모음',
        videoCount: 10,
        created_at: new Date().toISOString(),
      },
    ]);
  }),

  // ========== 강의 API Mocks ==========
  http.get('/api/courses', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Next.js 마스터 클래스',
        description: '실전 프로젝트로 배우는 Next.js',
        instructor: '김강사',
        originalPrice: 150000,
        discountedPrice: 99000,
        thumbnail: '/images/courses/nextjs.jpg',
        rating: 4.8,
        student_count: 1234,
      },
      {
        id: 2,
        title: 'React Query 완벽 가이드',
        description: '서버 상태 관리의 모든 것',
        instructor: '박강사',
        originalPrice: 120000,
        discountedPrice: 89000,
        thumbnail: '/images/courses/react-query.jpg',
        rating: 4.9,
        student_count: 987,
      },
    ]);
  }),

  http.get('/api/courses/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: Number(id),
      title: `Course ${id} Details`,
      description: '상세 설명...',
      curriculum: [{ id: 1, title: '섹션 1', lessons: ['레슨 1', '레슨 2'] }],
    });
  }),

  // ========== 사용자 인증 API Mocks ==========
  http.get('/api/user/profile', ({ cookies }) => {
    // 쿠키를 통한 인증 상태 시뮬레이션
    const isAuthenticated = cookies['sb-access-token'];

    if (!isAuthenticated) {
      return HttpResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    return HttpResponse.json({
      id: 'mock_user_id',
      email: 'test@example.com',
      username: 'testuser',
      profile: {
        nickname: '테스트유저',
        avatar: null,
      },
    });
  }),

  http.post('/api/user/api-keys', async ({ request }) => {
    const _body = await request.json();

    return HttpResponse.json({
      success: true,
      message: 'API 키가 저장되었습니다.',
      encrypted: true,
    });
  }),

  // ========== 수익 인증 API Mocks ==========
  http.get('/api/revenue-proof', () => {
    return HttpResponse.json([
      {
        id: 'proof_1',
        title: '첫 수익 달성!',
        amount: 1000000,
        platform: 'YouTube',
        proofImage: '/images/proof/sample.jpg',
        likes: 123,
        created_at: new Date().toISOString(),
      },
    ]);
  }),

  http.post('/api/revenue-proof', async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title');

    return HttpResponse.json({
      id: 'new_proof',
      title: title as string,
      success: true,
    });
  }),

  // ========== 결제 API Mocks ==========
  http.post('/api/payment/create-intent', async ({ request }) => {
    const body = await request.json();

    // Type guard to ensure body is an object
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return HttpResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const paymentData = body as Record<string, unknown>;

    return HttpResponse.json({
      orderId: `order_${Date.now()}`,
      amount: paymentData.amount || 0,
      orderName: paymentData.orderName || '',
      customerEmail: paymentData.customerEmail || '',
      successUrl: '/payment/success',
      failUrl: '/payment/fail',
    });
  }),

  // ========== 에러 시뮬레이션 ==========
  // 네트워크 에러 시뮬레이션
  http.get('/api/test/network-error', () => {
    return HttpResponse.error();
  }),

  // 타임아웃 시뮬레이션
  http.get('/api/test/timeout', async () => {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    return HttpResponse.json({ message: 'This should timeout' });
  }),

  // 500 에러 시뮬레이션
  http.get('/api/test/server-error', () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),

  // Rate Limit 시뮬레이션
  http.get('/api/test/rate-limit', () => {
    return HttpResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }),
];
