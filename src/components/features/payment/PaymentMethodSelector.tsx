'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { requestPayment, type PaymentMethod } from '@/lib/tosspayments/client';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet,
  Loader2
} from 'lucide-react';

interface PaymentMethodSelectorProps {
  orderId: string;
  amount: number;
  orderName: string;
  customerName: string;
  customerEmail?: string;
  customerMobilePhone?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface PaymentOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const paymentOptions: PaymentOption[] = [
  {
    value: '카드',
    label: '신용/체크카드',
    description: '모든 카드사 지원',
    icon: <CreditCard className="h-5 w-5" />,
    popular: true,
  },
  {
    value: '카카오페이',
    label: '카카오페이',
    description: '카카오 간편결제',
    icon: <Wallet className="h-5 w-5 text-yellow-600" />,
  },
  {
    value: '네이버페이',
    label: '네이버페이',
    description: '네이버 간편결제',
    icon: <Wallet className="h-5 w-5 text-green-600" />,
  },
  {
    value: '토스페이',
    label: '토스페이',
    description: '토스 간편결제',
    icon: <Wallet className="h-5 w-5 text-blue-600" />,
  },
  {
    value: '계좌이체',
    label: '계좌이체',
    description: '실시간 계좌이체',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    value: '휴대폰',
    label: '휴대폰 결제',
    description: '통신사 소액결제',
    icon: <Smartphone className="h-5 w-5" />,
  },
  {
    value: '가상계좌',
    label: '가상계좌',
    description: '무통장 입금 (입금 확인 후 처리)',
    icon: <Building2 className="h-5 w-5" />,
  },
];

export function PaymentMethodSelector({
  orderId,
  amount,
  orderName,
  customerName,
  customerEmail,
  customerMobilePhone,
  onSuccess,
  onError,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('카드');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      await requestPayment(selectedMethod, {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail,
        customerMobilePhone,
        successUrl: `${window.location.origin}/payment/success?orderId=${orderId}`,
        failUrl: `${window.location.origin}/payment/fail?orderId=${orderId}`,
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Payment error:', error);
      
      // 사용자가 취소한 경우는 에러로 처리하지 않음
      if (error instanceof Error && !error.message.includes('사용자가 결제를 취소')) {
        onError?.(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number): string => {
    return `₩${price.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>결제 수단 선택</CardTitle>
        <CardDescription>
          원하시는 결제 수단을 선택하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup 
          value={selectedMethod} 
          onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
        >
          <div className="grid gap-3">
            {paymentOptions.map((option) => (
              <div key={option.value} className="relative">
                {option.popular && (
                  <span className="absolute -top-2 right-2 z-10 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    인기
                  </span>
                )}
                <Label
                  htmlFor={option.value}
                  className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-accent"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">결제 금액</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(amount)}
            </span>
          </div>
        </div>

        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              {formatPrice(amount)} 결제하기
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          토스페이먼츠가 제공하는 안전한 결제 시스템을 사용합니다
        </p>
      </CardContent>
    </Card>
  );
}