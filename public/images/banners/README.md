# 📸 배너 이미지 관리 가이드

## 이미지 교체 방법 (비개발자용)

### 1. 이미지 준비
- **권장 크기**: 1920x600px (데스크톱 기준)
- **권장 포맷**: JPG 또는 PNG
- **파일 크기**: 500KB 이하 권장

### 2. 이미지 업로드
1. 이 폴더(`public/images/banners/`)에 이미지를 업로드합니다
2. 파일명은 `main-1.jpg`, `main-2.jpg` 형식으로 지정합니다

### 3. 캐러셀 설정 변경
1. `src/data/carousel-content.ts` 파일을 엽니다
2. 원하는 슬라이드의 `src` 값을 새 이미지 경로로 변경합니다

### 예시:
```typescript
{
  id: 1,
  type: 'image',
  src: '/images/banners/main-1.jpg', // ← 이 부분만 변경
  title: '제목',
  subtitle: '부제목',
  link: '/링크'
}
```

### 4. YouTube 영상 추가
YouTube URL에서 ID를 추출하여 추가:
- URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- ID: `dQw4w9WgXcQ` (v= 뒤의 부분)

```typescript
{
  id: 2,
  type: 'youtube',
  videoId: 'dQw4w9WgXcQ', // ← YouTube ID만 입력
  title: '제목',
  subtitle: '부제목',
  link: '/링크'
}
```

## 현재 배너 목록
- `main-1.jpg`: 메인 배너 1
- `main-2.jpg`: 메인 배너 2
- `main-3.jpg`: 메인 배너 3

## 주의사항
- 이미지 파일명에 특수문자나 공백을 사용하지 마세요
- 이미지가 너무 크면 로딩이 느려질 수 있습니다
- YouTube 썸네일은 자동으로 가져오므로 별도 이미지가 필요 없습니다