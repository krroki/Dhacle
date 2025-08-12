'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styled from 'styled-components';
import { StripeTypography } from '@/components/design-system';
import { theme, colors, spacing } from '@/components/design-system/common';

const BannerContainer = styled.div`
  background-color: ${colors.primary.blue.default};
  padding: ${spacing[2]} ${spacing[4]};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 45px;
  border-bottom: 1px solid ${colors.neutral.gray['300']};
`;

const BannerContent = styled.div`
  max-width: 1200px;
  width: 100%;
  text-align: center;
  padding-right: ${spacing[8]};
`;

const CloseButton = styled.button`
  position: absolute;
  right: ${spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${spacing[1]};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 200ms ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const CloseIcon = styled(X)`
  color: ${colors.neutral.white};
`;

const BannerText = styled(StripeTypography)`
  font-weight: ${theme.typography.fontWeight.medium};
`;

export function TopBanner() {
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
    <BannerContainer>
      <BannerContent>
        <BannerText 
          variant="body" 
          color="inverse"
        >
          ?�� ?�버버튼 챌린지 5�??�인 ?�택 관??공�? ?��
        </BannerText>
      </BannerContent>
      
      <CloseButton
        onClick={handleClose}
        aria-label="배너 ?�기"
      >
        <CloseIcon size={20} />
      </CloseButton>
    </BannerContainer>
  );
}
