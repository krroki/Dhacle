'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Mail } from 'lucide-react';

export function FooterClient() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('이메일을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 실제 API 호출 (향후 구현)
      // await apiPost('/api/newsletter/subscribe', { email });
      
      // 임시로 성공 메시지 표시
      setMessage('뉴스레터 구독이 완료되었습니다!');
      setEmail('');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('구독 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md">
      <h3 className="font-semibold mb-4">뉴스레터 구독</h3>
      <p className="text-sm text-muted-foreground mb-4">
        최신 업데이트와 크리에이터 팁을 받아보세요.
      </p>
      
      <form onSubmit={handleNewsletterSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="shrink-0"
          >
            <Mail className="h-4 w-4 mr-1" />
            구독
          </Button>
        </div>
        
        {message && (
          <p className={`text-xs ${message.includes('완료') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}