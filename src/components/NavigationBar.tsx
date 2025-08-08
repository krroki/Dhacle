import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { FiMenu, FiX } from 'react-icons/fi';
import { colors } from '../styles/tokens/colors';
import { effects } from '../styles/tokens/effects';
import { typography } from '../styles/tokens/typography';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { PillButton } from './PillButton';

// Types
export interface NavigationBarProps {
  currentPath?: string;
  onLogin?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
}

// Navigation items
const NAV_ITEMS = [
  { id: 'home', label: '홈', path: '/' },
  { id: 'courses', label: '강의', path: '/courses' },
  { id: 'templates', label: '템플릿', path: '/templates' },
  { id: 'tools', label: '도구', path: '/tools' },
  { id: 'community', label: '커뮤니티', path: '/community' },
];

// Styled components
const NavContainer = styled.nav<{ isScrolled: boolean }>`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all ${effects.animation.duration.normal} ${effects.animation.easing.smooth};
  
  /* Glassmorphism effect */
  background: ${props => props.isScrolled 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'transparent'};
  backdrop-filter: ${props => props.isScrolled 
    ? 'blur(8px)' 
    : 'none'};
  -webkit-backdrop-filter: ${props => props.isScrolled 
    ? 'blur(8px)' 
    : 'none'};
  border-bottom: ${props => props.isScrolled 
    ? `1px solid ${colors.neutral[100]}` 
    : 'none'};
  box-shadow: ${props => props.isScrolled 
    ? effects.shadows.sm 
    : 'none'};
`;

const NavWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.a`
  font-size: ${typography.fontSize.h3};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  text-decoration: none;
  transition: opacity ${effects.animation.duration.fast};
  
  &:hover {
    opacity: 0.8;
  }
`;

const DesktopNav = styled.div`
  display: none;
  align-items: center;
  gap: 32px;
  
  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavList = styled.ul`
  display: flex;
  align-items: center;
  gap: 24px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li``;

const NavLink = styled.a<{ isActive?: boolean }>`
  font-size: ${typography.fontSize.body};
  font-weight: ${props => props.isActive ? typography.fontWeight.medium : typography.fontWeight.regular};
  color: ${props => props.isActive ? colors.primary.main : colors.neutral[700]};
  text-decoration: none;
  padding: 8px 12px;
  border-radius: ${effects.borderRadius.md};
  transition: all ${effects.animation.duration.fast};
  position: relative;
  
  &:hover {
    color: ${colors.primary.main};
    background: ${colors.neutral[50]};
  }
  
  ${props => props.isActive && css`
    &::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: ${colors.primary.main};
    }
  `}
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const KakaoLoginButton = styled.button`
  background: #FEE500;
  color: #191919;
  border: none;
  border-radius: ${effects.borderRadius.pill};
  padding: 10px 20px;
  font-size: ${typography.fontSize.body};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${effects.animation.duration.fast};
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #FDD835;
    transform: translateY(-1px);
    box-shadow: ${effects.shadows.sm};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: ${effects.borderRadius.pill};
  background: ${colors.neutral[50]};
  cursor: pointer;
  transition: all ${effects.animation.duration.fast};
  
  &:hover {
    background: ${colors.neutral[100]};
  }
`;

const UserName = styled.span`
  font-size: ${typography.fontSize.body};
  color: ${colors.neutral[800]};
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: ${colors.neutral[700]};
  transition: color ${effects.animation.duration.fast};
  
  &:hover {
    color: ${colors.primary.main};
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: ${colors.neutral[0]};
  box-shadow: ${effects.shadows.xl};
  transform: translateX(${props => props.isOpen ? '0' : '100%'});
  transition: transform ${effects.animation.duration.normal} ${effects.animation.easing.smooth};
  z-index: 1001;
  padding: 24px;
  overflow-y: auto;
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const MobileMenuTitle = styled.h2`
  font-size: ${typography.fontSize.h3};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  margin: 0;
`;

const MobileCloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: ${colors.neutral[600]};
  transition: color ${effects.animation.duration.fast};
  
  &:hover {
    color: ${colors.neutral[900]};
  }
`;

const MobileNavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MobileNavItem = styled.li``;

const MobileNavLink = styled.a<{ isActive?: boolean }>`
  display: block;
  padding: 12px 16px;
  font-size: ${typography.fontSize.body};
  font-weight: ${props => props.isActive ? typography.fontWeight.medium : typography.fontWeight.regular};
  color: ${props => props.isActive ? colors.primary.main : colors.neutral[700]};
  text-decoration: none;
  border-radius: ${effects.borderRadius.md};
  transition: all ${effects.animation.duration.fast};
  
  &:hover {
    background: ${colors.neutral[50]};
    color: ${colors.primary.main};
  }
  
  ${props => props.isActive && css`
    background: ${colors.primary.light}20;
  `}
`;

const MobileAuthSection = styled.div`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid ${colors.neutral[200]};
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all ${effects.animation.duration.normal};
  z-index: 1000;
`;

// Main component
export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentPath = '/',
  onLogin,
  isLoggedIn = false,
  userName = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isScrolled } = useScrollPosition({ threshold: 50, throttleMs: 100 });

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const renderAuthSection = () => {
    if (isLoggedIn && userName) {
      return (
        <UserMenu>
          <UserName>{userName}</UserName>
        </UserMenu>
      );
    }

    return (
      <KakaoLoginButton onClick={onLogin} aria-label="카카오 로그인">
        <span>카카오 로그인</span>
      </KakaoLoginButton>
    );
  };

  return (
    <>
      <NavContainer isScrolled={isScrolled} role="navigation" aria-label="메인 네비게이션">
        <NavWrapper>
          <Logo href="/" aria-label="쇼츠 스튜디오 홈">
            쇼츠 스튜디오
          </Logo>

          <DesktopNav>
            <NavList>
              {NAV_ITEMS.map(item => (
                <NavItem key={item.id}>
                  <NavLink 
                    href={item.path}
                    isActive={currentPath === item.path}
                    aria-current={currentPath === item.path ? 'page' : undefined}
                  >
                    {item.label}
                  </NavLink>
                </NavItem>
              ))}
            </NavList>

            <AuthSection>
              {renderAuthSection()}
            </AuthSection>
          </DesktopNav>

          <MobileMenuButton
            onClick={handleMobileMenuToggle}
            aria-label="메뉴 열기"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <FiMenu size={24} />
          </MobileMenuButton>
        </NavWrapper>
      </NavContainer>

      <Overlay isOpen={isMobileMenuOpen} onClick={handleMobileMenuClose} />
      
      <MobileMenu 
        id="mobile-menu"
        isOpen={isMobileMenuOpen}
        role="dialog"
        aria-label="모바일 메뉴"
        aria-modal="true"
      >
        <MobileMenuHeader>
          <MobileMenuTitle>메뉴</MobileMenuTitle>
          <MobileCloseButton
            onClick={handleMobileMenuClose}
            aria-label="메뉴 닫기"
          >
            <FiX size={24} />
          </MobileCloseButton>
        </MobileMenuHeader>

        <MobileNavList>
          {NAV_ITEMS.map(item => (
            <MobileNavItem key={item.id}>
              <MobileNavLink
                href={item.path}
                isActive={currentPath === item.path}
                onClick={handleMobileMenuClose}
                aria-current={currentPath === item.path ? 'page' : undefined}
              >
                {item.label}
              </MobileNavLink>
            </MobileNavItem>
          ))}
        </MobileNavList>

        <MobileAuthSection>
          {renderAuthSection()}
        </MobileAuthSection>
      </MobileMenu>
    </>
  );
};

export default NavigationBar;