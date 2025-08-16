# YouTube Lens 에러 처리 및 폴백 전략

## 📌 개요
YouTube Lens의 안정적인 서비스 운영을 위한 체계적인 에러 처리 및 폴백 전략 구현 가이드입니다.

## 🎯 에러 처리 철학

### 핵심 원칙
1. **Fail Gracefully**: 부분 실패 시에도 전체 서비스 유지
2. **User First**: 사용자에게 명확한 피드백 제공
3. **Auto Recovery**: 가능한 자동 복구 시도
4. **Degraded Mode**: 제한적이라도 서비스 지속

## 🔴 YouTube API 쿼터 관리

### 1. 쿼터 모니터링 시스템

```typescript
// src/lib/youtube/quota-manager.ts

interface QuotaConfig {
  daily_limit: number;      // 10,000 units
  warning_threshold: 0.7;   // 70% 경고
  critical_threshold: 0.9;  // 90% 위험
  reset_time: string;       // "00:00 PST"
}

class YouTubeQuotaManager {
  private static instance: YouTubeQuotaManager;
  private quotaUsed: number = 0;
  private quotaLimit: number = 10000;
  private lastReset: Date;
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * 쿼터 사용량 체크 및 제한
   */
  async checkQuota(operation: string, units: number): Promise<QuotaStatus> {
    const usage = this.quotaUsed / this.quotaLimit;
    
    // 위험 수준별 대응
    if (usage >= 0.95) {
      return {
        allowed: false,
        reason: 'QUOTA_CRITICAL',
        fallback: 'USE_CACHE_ONLY',
        message: 'API 한도 초과. 캐시된 데이터만 제공됩니다.',
      };
    }
    
    if (usage >= 0.9) {
      return {
        allowed: true,
        reason: 'QUOTA_WARNING',
        fallback: 'ESSENTIAL_ONLY',
        message: 'API 한도 90% 도달. 필수 요청만 처리됩니다.',
      };
    }
    
    if (usage >= 0.7) {
      // 공격적 캐싱 모드
      return {
        allowed: true,
        reason: 'QUOTA_CONSERVATIVE',
        fallback: 'AGGRESSIVE_CACHE',
        message: null,
      };
    }
    
    return {
      allowed: true,
      reason: 'QUOTA_OK',
      fallback: null,
      message: null,
    };
  }

  /**
   * 쿼터 초과 시 폴백 전략
   */
  async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackStrategy: FallbackStrategy
  ): Promise<T | null> {
    const quota = await this.checkQuota(fallbackStrategy.operation, fallbackStrategy.units);
    
    if (!quota.allowed) {
      // 폴백 전략 실행
      switch (quota.fallback) {
        case 'USE_CACHE_ONLY':
          return this.getCachedData(fallbackStrategy.cacheKey);
          
        case 'USE_MOCK_DATA':
          return this.getMockData(fallbackStrategy.operation);
          
        case 'DEFER_TO_QUEUE':
          return this.queueForLater(operation, fallbackStrategy);
          
        default:
          throw new QuotaExceededError(quota.message);
      }
    }
    
    try {
      const result = await operation();
      this.quotaUsed += fallbackStrategy.units;
      
      // 성공 시 캐시 저장
      if (fallbackStrategy.cacheable) {
        this.cache.set(fallbackStrategy.cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl: fallbackStrategy.cacheTTL || 3600000, // 1시간
        });
      }
      
      return result;
    } catch (error) {
      // API 에러 시 폴백
      return this.handleApiError(error, fallbackStrategy);
    }
  }

  /**
   * 지능형 캐시 전략
   */
  private getCachedData<T>(cacheKey: string): T | null {
    const entry = this.cache.get(cacheKey);
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      // 만료되었지만 쿼터 위험 시 stale 데이터라도 제공
      const quota = this.quotaUsed / this.quotaLimit;
      if (quota > 0.9) {
        console.warn('Serving stale cache due to quota limit');
        return entry.data as T;
      }
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * 대기열 관리
   */
  private async queueForLater<T>(
    operation: () => Promise<T>,
    strategy: FallbackStrategy
  ): Promise<T | null> {
    // Redis or in-memory queue
    await this.taskQueue.add({
      operation: operation.toString(),
      priority: strategy.priority || 'low',
      retryAt: this.getNextResetTime(),
      metadata: strategy,
    });
    
    // 사용자에게 알림
    this.notifyUser({
      type: 'QUEUED',
      message: '요청이 대기열에 추가되었습니다. 자정 이후 자동 처리됩니다.',
      estimatedTime: this.getNextResetTime(),
    });
    
    return null;
  }
}
```

### 2. API 비용 최적화 전략

```typescript
// src/lib/youtube/api-optimizer.ts

class YouTubeAPIOptimizer {
  /**
   * 배치 요청으로 쿼터 절약
   */
  async batchVideoDetails(videoIds: string[]): Promise<VideoDetails[]> {
    // 50개씩 배치 처리 (YouTube API 제한)
    const chunks = this.chunkArray(videoIds, 50);
    const results: VideoDetails[] = [];
    
    for (const chunk of chunks) {
      try {
        // 1번 요청으로 50개 처리 (쿼터 1 unit)
        const response = await youtube.videos.list({
          part: ['snippet', 'statistics', 'contentDetails'],
          id: chunk.join(','),
        });
        
        results.push(...response.data.items);
      } catch (error) {
        // 부분 실패 처리
        console.error(`Batch failed for ${chunk.length} videos`);
        
        // 개별 폴백 (쿼터 비용 높음)
        if (this.shouldFallbackToIndividual(error)) {
          const individual = await this.fetchIndividually(chunk);
          results.push(...individual);
        }
      }
    }
    
    return results;
  }

  /**
   * 스마트 필드 선택
   */
  optimizeFieldSelection(requiredData: string[]): string[] {
    // 필요한 것만 요청하여 응답 크기 최소화
    const fieldMap = {
      title: 'snippet',
      views: 'statistics',
      duration: 'contentDetails',
      thumbnail: 'snippet',
    };
    
    const parts = new Set<string>();
    requiredData.forEach(field => {
      if (fieldMap[field]) {
        parts.add(fieldMap[field]);
      }
    });
    
    return Array.from(parts);
  }

  /**
   * 예측 기반 프리페칭
   */
  async predictivePrefetch(userPattern: UserBehavior): Promise<void> {
    // 사용자 패턴 분석
    const likelyNextQueries = this.predictNextActions(userPattern);
    
    // 유휴 시간에 미리 가져오기
    if (this.isIdleTime() && this.hasQuotaAvailable()) {
      for (const query of likelyNextQueries) {
        await this.prefetchInBackground(query);
      }
    }
  }
}
```

## 🌐 네트워크 에러 처리

### 3. 재시도 및 회로 차단기 패턴

```typescript
// src/lib/utils/resilience.ts

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

class NetworkResilience {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  
  /**
   * 지수 백오프를 포함한 재시도 로직
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    config: RetryConfig = {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
    }
  ): Promise<T> {
    let lastError: Error;
    let delay = config.initialDelay;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        // 지터 추가로 동시 재시도 방지
        const jitter = Math.random() * 1000;
        if (attempt > 1) {
          await this.sleep(delay + jitter);
        }
        
        return await operation();
        
      } catch (error: any) {
        lastError = error;
        
        // 재시도 불가능한 에러 즉시 중단
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        // 로깅
        console.warn(`Attempt ${attempt}/${config.maxAttempts} failed:`, {
          error: error.message,
          nextDelay: delay,
        });
        
        // 백오프 증가
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      }
    }
    
    throw new MaxRetriesExceededError(
      `Failed after ${config.maxAttempts} attempts`,
      lastError!
    );
  }

  /**
   * 회로 차단기 패턴
   */
  async withCircuitBreaker<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    let breaker = this.circuitBreakers.get(serviceName);
    
    if (!breaker) {
      breaker = new CircuitBreaker({
        name: serviceName,
        timeout: 5000,
        errorThreshold: 50, // 50% 에러율
        volumeThreshold: 10, // 최소 10개 요청
        sleepWindow: 60000, // 1분 대기
      });
      this.circuitBreakers.set(serviceName, breaker);
    }
    
    // 회로 상태 확인
    if (breaker.isOpen()) {
      console.warn(`Circuit breaker OPEN for ${serviceName}`);
      
      if (fallback) {
        return fallback();
      }
      
      throw new ServiceUnavailableError(
        `${serviceName} is temporarily unavailable`
      );
    }
    
    try {
      const result = await breaker.execute(operation);
      return result;
      
    } catch (error) {
      // 회로 차단기 트리거
      breaker.recordFailure();
      
      if (fallback && breaker.isOpen()) {
        return fallback();
      }
      
      throw error;
    }
  }

  /**
   * 재시도 불가능한 에러 판별
   */
  private isNonRetryableError(error: any): boolean {
    // HTTP 상태 코드 기반
    if (error.status) {
      const nonRetryableCodes = [400, 401, 403, 404, 422];
      return nonRetryableCodes.includes(error.status);
    }
    
    // YouTube API 특정 에러
    if (error.code) {
      const nonRetryableCodes = [
        'quotaExceeded',
        'forbidden',
        'invalidRequest',
        'videoNotFound',
      ];
      return nonRetryableCodes.includes(error.code);
    }
    
    return false;
  }
}
```

## 🔄 외부 서비스 장애 대응

### 4. 다중 서비스 폴백 체인

```typescript
// src/lib/fallback/service-fallback.ts

class ServiceFallbackChain {
  private fallbackChains = {
    trending: [
      this.fetchFromYouTube,
      this.fetchFromCache,
      this.fetchFromGDELT,
      this.fetchFromWikipedia,
      this.returnStaticData,
    ],
    search: [
      this.searchYouTube,
      this.searchCache,
      this.searchElasticsearch,
      this.returnEmptyResults,
    ],
  };

  /**
   * 순차적 폴백 실행
   */
  async executeWithFallbacks<T>(
    operation: string,
    params: any
  ): Promise<FallbackResult<T>> {
    const chain = this.fallbackChains[operation];
    if (!chain) {
      throw new Error(`No fallback chain for operation: ${operation}`);
    }
    
    const errors: Error[] = [];
    let degraded = false;
    
    for (const [index, fallback] of chain.entries()) {
      try {
        const result = await fallback(params);
        
        if (index > 0) {
          degraded = true;
        }
        
        return {
          success: true,
          data: result,
          degraded,
          source: fallback.name,
          errors: errors.length > 0 ? errors : undefined,
        };
        
      } catch (error: any) {
        errors.push(error);
        console.error(`Fallback ${index + 1}/${chain.length} failed:`, error.message);
      }
    }
    
    // 모든 폴백 실패
    return {
      success: false,
      data: null,
      degraded: true,
      source: 'none',
      errors,
    };
  }

  /**
   * 우선순위 기반 서비스 선택
   */
  async selectHealthyService(services: ServiceEndpoint[]): Promise<ServiceEndpoint> {
    const healthChecks = await Promise.allSettled(
      services.map(service => this.checkHealth(service))
    );
    
    const healthyServices = services.filter((service, index) => {
      const check = healthChecks[index];
      return check.status === 'fulfilled' && check.value.healthy;
    });
    
    if (healthyServices.length === 0) {
      throw new AllServicesDownError('No healthy services available');
    }
    
    // 응답 시간 기반 정렬
    healthyServices.sort((a, b) => a.avgResponseTime - b.avgResponseTime);
    
    return healthyServices[0];
  }
}
```

## 🎨 사용자 친화적 에러 메시지

### 5. 에러 메시지 현지화 및 액션 제안

```typescript
// src/lib/errors/user-messages.ts

class UserErrorMessages {
  private messages = {
    ko: {
      QUOTA_EXCEEDED: {
        title: 'API 한도 초과',
        message: '오늘의 YouTube API 사용량을 모두 소진했습니다.',
        action: '내일 자정에 자동으로 초기화됩니다. 지금은 캐시된 데이터를 확인해주세요.',
        severity: 'warning',
      },
      NETWORK_ERROR: {
        title: '네트워크 연결 오류',
        message: '서버와 연결할 수 없습니다.',
        action: '인터넷 연결을 확인하고 다시 시도해주세요.',
        severity: 'error',
      },
      RATE_LIMITED: {
        title: '요청 속도 제한',
        message: '너무 많은 요청을 보내셨습니다.',
        action: '잠시 후 다시 시도해주세요.',
        severity: 'info',
      },
      PARTIAL_FAILURE: {
        title: '일부 데이터 로드 실패',
        message: '일부 정보를 가져오는데 실패했습니다.',
        action: '페이지를 새로고침하면 누락된 데이터를 다시 가져옵니다.',
        severity: 'warning',
      },
    },
    en: {
      // English messages...
    },
  };

  /**
   * 에러 코드를 사용자 메시지로 변환
   */
  getUserMessage(
    errorCode: string,
    locale: string = 'ko',
    context?: any
  ): UserMessage {
    const message = this.messages[locale]?.[errorCode] || this.messages.ko.GENERIC_ERROR;
    
    // 컨텍스트 기반 메시지 커스터마이징
    if (context) {
      message.message = this.interpolate(message.message, context);
    }
    
    // 추가 도움말 링크
    if (this.hasHelpArticle(errorCode)) {
      message.helpLink = `/help/errors/${errorCode}`;
    }
    
    // 자동 복구 가능 여부
    if (this.isAutoRecoverable(errorCode)) {
      message.autoRecovery = {
        enabled: true,
        estimatedTime: this.getRecoveryTime(errorCode),
      };
    }
    
    return message;
  }

  /**
   * 에러 토스트 표시
   */
  showErrorToast(error: AppError): void {
    const message = this.getUserMessage(error.code, error.locale);
    
    // 심각도에 따른 표시 방식
    switch (message.severity) {
      case 'error':
        toast.error(message.title, {
          description: message.message,
          action: message.action ? {
            label: '해결하기',
            onClick: () => this.handleErrorAction(error.code),
          } : undefined,
          duration: 10000,
        });
        break;
        
      case 'warning':
        toast.warning(message.title, {
          description: message.message,
          duration: 7000,
        });
        break;
        
      case 'info':
        toast.info(message.title, {
          description: message.message,
          duration: 5000,
        });
        break;
    }
  }
}
```

## 📊 에러 모니터링 및 알림

### 6. 실시간 에러 추적

```typescript
// src/lib/monitoring/error-tracking.ts

class ErrorMonitoring {
  private errorCounts: Map<string, number> = new Map();
  private errorPatterns: ErrorPattern[] = [];
  
  /**
   * 에러 패턴 감지 및 알림
   */
  trackError(error: AppError): void {
    // 에러 카운트 증가
    const count = (this.errorCounts.get(error.code) || 0) + 1;
    this.errorCounts.set(error.code, count);
    
    // 패턴 감지
    if (this.detectAnomalousPattern(error.code, count)) {
      this.alertAdmins({
        type: 'ERROR_SPIKE',
        code: error.code,
        count,
        threshold: this.getThreshold(error.code),
        severity: 'high',
      });
    }
    
    // Sentry 전송
    if (this.shouldReportToSentry(error)) {
      Sentry.captureException(error, {
        tags: {
          errorCode: error.code,
          service: error.service,
        },
        extra: {
          fallbackUsed: error.fallbackUsed,
          degradedMode: error.degradedMode,
        },
      });
    }
    
    // 메트릭 수집
    this.metrics.increment('errors.count', {
      code: error.code,
      severity: error.severity,
    });
  }

  /**
   * 자동 복구 시도
   */
  async attemptAutoRecovery(error: AppError): Promise<boolean> {
    const recoveryStrategies = {
      QUOTA_EXCEEDED: this.waitForQuotaReset,
      CIRCUIT_OPEN: this.waitForCircuitReset,
      RATE_LIMITED: this.waitForRateLimit,
      CACHE_MISS: this.rebuildCache,
    };
    
    const strategy = recoveryStrategies[error.code];
    if (!strategy) {
      return false;
    }
    
    try {
      await strategy();
      
      // 복구 성공 알림
      this.notifyRecovery(error.code);
      return true;
      
    } catch (recoveryError) {
      console.error('Auto recovery failed:', recoveryError);
      return false;
    }
  }
}
```

## 🔧 구현 체크리스트

### 필수 구현 사항
- [ ] YouTube API 쿼터 매니저
- [ ] 재시도 로직 (지수 백오프)
- [ ] 회로 차단기 패턴
- [ ] 캐시 폴백 시스템
- [ ] 사용자 에러 메시지 현지화
- [ ] 에러 모니터링 대시보드

### 성능 목표
- 쿼터 사용률 < 80% 유지
- 에러율 < 1%
- 평균 복구 시간 < 30초
- 캐시 히트율 > 60%

### 모니터링 지표
- API 쿼터 사용량
- 에러 발생률
- 폴백 사용 빈도
- 서비스 가용성 (SLA 99.9%)