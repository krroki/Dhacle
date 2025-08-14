# YouTube Lens API Key 암호화 오류 해결 가이드

## 문제 상황
"유효한 API key입니다" 메시지 후 "Failed to encrypt API key" 오류 발생

## 해결 방법

### 1. 서버 재시작 (필수!)
환경 변수를 변경한 후에는 **반드시** 개발 서버를 재시작해야 합니다.

```bash
# 1. 현재 실행 중인 서버 중지
Ctrl + C (또는 터미널 창 닫기)

# 2. 서버 다시 시작
npm run dev
```

### 2. 환경 변수 확인
`.env.local` 파일에서 `ENCRYPTION_KEY`가 정확히 64자인지 확인:

```bash
# Windows PowerShell에서 확인
$key = Get-Content .env.local | Select-String "ENCRYPTION_KEY" | ForEach-Object { $_.Line.Split('=')[1] }
$key.Length  # 64가 출력되어야 함

# 새 키 생성이 필요한 경우
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. 디버깅 정보 확인
서버를 재시작한 후, API Key 저장을 시도하면 콘솔에 다음과 같은 디버깅 정보가 표시됩니다:

```
[DEBUG] Environment check: {
  hasKey: true,           // true여야 함
  keyLength: 64,          // 64여야 함
  firstChars: 'fc28...',  // 키의 처음 4자
  nodeEnv: 'development',
  runtime: 'server',
  cryptoAvailable: true   // true여야 함
}
```

### 4. 문제가 지속되는 경우

#### A. 캐시 삭제
```bash
# Next.js 캐시 삭제
rm -rf .next
npm run dev
```

#### B. Node.js 버전 확인
```bash
node --version  # v18.0.0 이상이어야 함
```

#### C. 환경 변수 직접 확인
```bash
# PowerShell
echo $env:ENCRYPTION_KEY

# 또는 Node.js로 확인
node -e "console.log(process.env.ENCRYPTION_KEY?.length || 'undefined')"
```

### 5. 완전 초기화 (최후의 수단)
```bash
# 1. 서버 중지
Ctrl + C

# 2. 캐시 및 node_modules 삭제
rm -rf .next node_modules package-lock.json

# 3. 패키지 재설치
npm install

# 4. .env.local 확인 (ENCRYPTION_KEY가 64자인지)

# 5. 서버 시작
npm run dev
```

## 성공 확인
- "유효한 API key입니다" → "API key가 성공적으로 저장되었습니다" 메시지
- 콘솔에 에러 없음
- YouTube Lens 기능 정상 작동

## 주의사항
- ENCRYPTION_KEY를 변경하면 기존에 저장된 모든 API Key를 다시 등록해야 합니다
- 프로덕션 환경에서는 디버깅 코드를 제거해야 합니다 (`crypto.ts`의 console.log 부분)

## 관련 파일
- `/src/lib/api-keys/crypto.ts` - 암호화 로직
- `/src/app/api/user/api-keys/route.ts` - API 엔드포인트
- `/.env.local` - 환경 변수 설정