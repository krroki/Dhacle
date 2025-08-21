import { loadTossPayments, type TossPaymentsInstance } from '@tosspayments/payment-sdk';

// 토스페이먼츠 클라이언트 키
const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

if (!tossClientKey) {
}

// 토스페이먼츠 Promise (싱글톤)
let tossPaymentsPromise: Promise<TossPaymentsInstance | null> | null = null;

/**
 * 토스페이먼츠 클라이언트 인스턴스를 가져옵니다.
 * 싱글톤 패턴으로 한 번만 초기화됩니다.
 */
export const getTossPayments = () => {
  if (!tossPaymentsPromise && tossClientKey) {
    tossPaymentsPromise = loadTossPayments(tossClientKey);
  }
  return tossPaymentsPromise;
};

// 통화 포맷터 (기존 코드 재사용)
export const formatKRW = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// 토스페이먼츠 결제 수단 타입
export type PaymentMethod =
  | '카드'
  | '가상계좌'
  | '계좌이체'
  | '휴대폰'
  | '토스페이'
  | '카카오페이'
  | '네이버페이'
  | '페이코'
  | '삼성페이';

// 토스페이먼츠 결제 옵션 인터페이스
export interface TossPaymentOptions {
  amount: number;
  orderId: string;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  customerMobilePhone?: string;
  successUrl: string;
  failUrl: string;
  // 간편결제 추가 옵션
  validHours?: number; // 결제 유효 시간 (기본 24시간)
  useEscrow?: boolean; // 에스크로 사용 여부
  cashReceipt?: {
    type: '소득공제' | '지출증빙';
    registrationNumber: string; // 휴대폰 번호 또는 사업자번호
  };
  // 가상계좌 옵션
  virtualAccount?: {
    validHours?: number; // 입금 기한 (기본 72시간)
    cashReceipt?: {
      type: '소득공제' | '지출증빙';
      registrationNumber: string;
    };
  };
}

// 토스페이먼츠 에러 메시지 한글화
export const getTossErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    // 공통 에러
    INVALID_CARD_COMPANY: '유효하지 않은 카드입니다.',
    INVALID_CARD_NUMBER: '카드 번호가 올바르지 않습니다.',
    INVALID_CARD_EXPIRATION: '카드 유효기간이 올바르지 않습니다.',
    EXCEED_MAX_AMOUNT: '결제 금액이 한도를 초과했습니다.',
    EXCEED_MAX_DAILY_AMOUNT: '일일 결제 한도를 초과했습니다.',
    EXCEED_MAX_MONTHLY_AMOUNT: '월 결제 한도를 초과했습니다.',

    // 카드 관련 에러
    CARD_LIMIT_EXCEEDED: '카드 한도를 초과했습니다.',
    CARD_DECLINED: '카드가 거부되었습니다.',
    EXPIRED_CARD: '만료된 카드입니다.',
    INCORRECT_CVC: 'CVC 번호가 올바르지 않습니다.',
    INSUFFICIENT_BALANCE: '잔액이 부족합니다.',
    LOST_OR_STOLEN_CARD: '분실 또는 도난 카드입니다.',
    RESTRICTED_CARD: '사용이 제한된 카드입니다.',

    // 간편결제 에러
    NOT_AVAILABLE_PAYMENT: '사용할 수 없는 결제 수단입니다.',
    PAYMENT_TIMEOUT: '결제 시간이 초과되었습니다.',
    USER_CANCEL: '사용자가 결제를 취소했습니다.',

    // 가상계좌 에러
    VIRTUAL_ACCOUNT_NOT_FOUND: '가상계좌를 찾을 수 없습니다.',
    VIRTUAL_ACCOUNT_EXPIRED: '가상계좌 입금 기한이 만료되었습니다.',

    // 시스템 에러
    INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  };

  return errorMessages[code] || '결제 처리 중 오류가 발생했습니다.';
};

// 결제 요청 헬퍼 함수
export const requestPayment = async (method: PaymentMethod, options: TossPaymentOptions) => {
  const tossPayments = await getTossPayments();

  if (!tossPayments) {
    throw new Error('토스페이먼츠 초기화에 실패했습니다.');
  }

  try {
    // 결제창 호출
    await tossPayments.requestPayment(method, {
      amount: options.amount,
      orderId: options.orderId,
      orderName: options.orderName,
      customerName: options.customerName,
      customerEmail: options.customerEmail,
      customerMobilePhone: options.customerMobilePhone,
      successUrl: options.successUrl,
      failUrl: options.failUrl,
      validHours: options.validHours,
      // 가상계좌 옵션
      ...(method === '가상계좌' &&
        options.virtualAccount && {
          virtualAccount: options.virtualAccount,
        }),
      // 현금영수증 옵션
      ...(options.cashReceipt && {
        cashReceipt: options.cashReceipt,
      }),
    });
  } catch (error) {
    // 에러 처리
    if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
      throw new Error(getTossErrorMessage(error.code));
    }
    throw error;
  }
};

// 결제 위젯 헬퍼 함수 (더 간단한 UI를 원할 경우)
export const createPaymentWidget = async (_elementId: string) => {
  const tossPayments = await getTossPayments();

  if (!tossPayments) {
    throw new Error('토스페이먼츠 초기화에 실패했습니다.');
  }

  // 결제 위젯 렌더링
  const widget = tossPayments.widgets({
    customerKey: 'ANONYMOUS', // 비회원 결제의 경우
  });

  await widget.setAmount({
    currency: 'KRW',
    value: 0, // 초기값, 나중에 업데이트
  });

  return widget;
};
