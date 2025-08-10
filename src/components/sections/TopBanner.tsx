'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { StripeTypography } from '@/components/design-system';
import { useTheme } from '@/lib/theme/ThemeProvider';

export function TopBanner() {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was closed in the last 24 hours
    const closedTime = localStorage.getItem('topBannerClosed');
    if (closedTime) {
      const timeDiff = Date.now() - parseInt(closedTime);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        setIsVisible(false);
        return;
      }
    }
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('topBannerClosed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        backgroundColor: '#FFD700', // FastCampus yellow
        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '45px',
        borderBottom: `1px solid ${theme.colors.neutral.gray['300']}`
      }}
    >
      <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center', paddingRight: theme.spacing[8] }}>
        <StripeTypography 
          variant="body" 
          color="dark"
          className="font-medium"
        >
          🎯 8월 12일까지만 앱콜 | 지금 구매하면 특가 할인 혜택받을 수 있는 1+1 쿠폰 증정!
        </StripeTypography>
      </div>
      
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          right: theme.spacing[4],
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: theme.spacing[1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="배너 닫기"
      >
        <X size={20} style={{ color: theme.colors.text.primary.dark }} />
      </button>
    </div>
  );
}