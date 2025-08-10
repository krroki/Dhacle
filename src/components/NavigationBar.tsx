import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';
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
const NavContainer = styled.nav<{ $isScrolled: boolean }>`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 102;
  transition: all ${effects.animation.duration.normal} ${effects.animation.easing.smooth};
  
  /* FastCampus style - always white background */
  background: rgb(255, 255, 255);
  border-bottom: ${props => props.$isScrolled 
    ? `1px solid ${colors.neutral[200]}` 
    : `1px solid ${colors.neutral[100]}`};
  box-shadow: ${props => props.$isScrolled 
    ? '0 2px 8px rgba(0, 0, 0, 0.08)' 
    : 'none'};
`;

const NavWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px; /* Standard padding for clean alignment */
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px; /* Fixed height for consistent alignment */
`;

const Logo = styled.a`
  font-size: 22px;
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.neutral[900]};
  text-decoration: none;
  transition: all ${effects.animation.duration.fast};
  display: flex;
  align-items: center;
  flex-shrink: 0; /* Prevent logo from shrinking */
  
  &:hover {
    color: ${colors.primary.main};
    transform: scale(1.02);
  }
`;

const DesktopNav = styled.div`
  display: none;
  align-items: center;
  flex: 1;
  justify-content: flex-end; /* Align everything to the right */
  gap: 32px;
  margin-left: 32px; /* Space between logo and nav */
  
  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavList = styled.ul`
  display: flex;
  align-items: center;
  gap: 8px; /* Smaller gap for tighter menu */
  list-style: none;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
`;

const NavItem = styled.li``;

const NavLink = styled.a<{ $isActive?: boolean }>`
  font-size: 16px;
  font-weight: ${props => props.$isActive ? '700' : '500'};
  color: ${props => props.$isActive ? colors.neutral[900] : colors.neutral[600]};
  text-decoration: none;
  padding: 8px 12px;
  border-radius: ${effects.borderRadius.md};
  transition: all ${effects.animation.duration.fast} ${effects.animation.easing.smooth};
  position: relative;
  white-space: nowrap;
  
  &:hover {
    color: ${colors.neutral[900]};
    background: ${colors.neutral[50]};
  }
  
  ${props => props.$isActive && css`
    color: ${colors.neutral[900]};
    font-weight: 700;
  `}
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SearchBox = styled.div`
  position: relative;
  width: 320px;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    width: 240px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 40px 0 16px;
  border: 1px solid ${colors.neutral[200]};
  border-radius: ${effects.borderRadius.pill};
  font-size: 14px;
  background: ${colors.neutral[50]};
  transition: all ${effects.animation.duration.fast};
  
  &:focus {
    outline: none;
    border-color: ${colors.primary.main};
    background: ${colors.neutral[0]};
    box-shadow: 0 0 0 3px ${colors.primary.light}20;
  }
  
  &::placeholder {
    color: ${colors.neutral[400]};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.neutral[400]};
  pointer-events: none;
`;

const KakaoLoginButton = styled.button`
  background: #FEE500; /* Kakao brand yellow */
  color: #000000;
  border: none;
  border-radius: ${effects.borderRadius.pill};
  padding: 10px 20px;
  font-size: 14px;
  font-weight: ${typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${effects.animation.duration.fast} ${effects.animation.easing.smooth};
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #FDD835;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
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

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: ${colors.neutral[0]};
  box-shadow: ${effects.shadows.xl};
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
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

const MobileNavLink = styled.a<{ $isActive?: boolean }>`
  display: block;
  padding: 12px 16px;
  font-size: ${typography.fontSize.body};
  font-weight: ${props => props.$isActive ? typography.fontWeight.medium : typography.fontWeight.regular};
  color: ${props => props.$isActive ? colors.primary.main : colors.neutral[700]};
  text-decoration: none;
  border-radius: ${effects.borderRadius.md};
  transition: all ${effects.animation.duration.fast};
  
  &:hover {
    background: ${colors.neutral[50]};
    color: ${colors.primary.main};
  }
  
  ${props => props.$isActive && css`
    background: ${colors.primary.light}20;
  `}
`;

const MobileAuthSection = styled.div`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid ${colors.neutral[200]};
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
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
      <KakaoLoginButton onClick={onLogin} aria-label="카카오로 로그인">
        <svg viewBox="0 0 18 18" fill="none">
          <path 
            d="M9 1C4.58 1 1 3.94 1 7.55c0 2.31 1.46 4.34 3.67 5.51l-.8 2.89c-.04.15.02.31.14.4.08.05.17.08.26.08.06 0 .11-.01.17-.03l3.36-1.78c.4.05.8.08 1.2.08 4.42 0 8-2.94 8-6.55C17 3.94 13.42 1 9 1z" 
            fill="currentColor"
          />
        </svg>
        <span>카카오로 로그인</span>
      </KakaoLoginButton>
    );
  };

  return (
    <>
      <NavContainer $isScrolled={isScrolled} role="navigation" aria-label="메인 네비게이션">
        <NavWrapper>
          <Logo href="/" aria-label="디하클 홈">
            디하클
          </Logo>

          <DesktopNav>
            <NavList>
              {NAV_ITEMS.map(item => (
                <NavItem key={item.id}>
                  <NavLink 
                    href={item.path}
                    $isActive={currentPath === item.path}
                    aria-current={currentPath === item.path ? 'page' : undefined}
                  >
                    {item.label}
                  </NavLink>
                </NavItem>
              ))}
            </NavList>

            <SearchBox>
              <SearchInput 
                type="search" 
                placeholder="무엇을 배우고 싶으신가요?"
                aria-label="강의 검색"
              />
              <SearchIcon>
                <FiSearch size={18} />
              </SearchIcon>
            </SearchBox>

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

      <Overlay $isOpen={isMobileMenuOpen} onClick={handleMobileMenuClose} />
      
      <MobileMenu 
        id="mobile-menu"
        $isOpen={isMobileMenuOpen}
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
                $isActive={currentPath === item.path}
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