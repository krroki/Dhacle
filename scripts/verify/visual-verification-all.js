/**
 * Visual Verification Script for All UI Components
 * Following VVP (Visual Verification Protocol) standards
 */

// Component verification checklist
const componentChecklist = {
  'ExperienceCard': {
    elements: ['image', 'title', 'rating', 'price', 'tags', 'save-button'],
    styles: ['backgroundColor', 'border', 'borderRadius', 'boxShadow'],
    interactions: ['hover', 'click'],
    status: 'PASS'
  },
  'PillButton': {
    elements: ['text', 'icon'],
    styles: ['backgroundColor', 'borderRadius', 'padding', 'fontSize'],
    interactions: ['hover', 'active'],
    status: 'NOT_TESTED'
  },
  'SearchBar': {
    elements: ['input', 'icon', 'placeholder'],
    styles: ['border', 'borderRadius', 'backgroundColor'],
    interactions: ['focus', 'type'],
    status: 'NOT_TESTED'
  },
  'NavigationBar': {
    elements: ['logo', 'menu-items', 'auth-button'],
    styles: ['backgroundColor', 'height', 'borderBottom'],
    interactions: ['scroll', 'menu-hover'],
    status: 'NOT_TESTED'
  }
};

// Visual verification results
const verificationResults = {
  timestamp: new Date().toISOString(),
  environment: {
    url: 'http://localhost:3011',
    viewport: { width: 1280, height: 720 },
    browser: 'Chromium'
  },
  components: {},
  screenshots: [],
  issues: [],
  summary: {
    total: 4,
    passed: 0,
    failed: 0,
    notTested: 4
  }
};

// Helper function to check element visibility
function checkElementVisibility(selector) {
  const element = document.querySelector(selector);
  if (!element) return { exists: false };
  
  const rect = element.getBoundingClientRect();
  const computed = window.getComputedStyle(element);
  
  return {
    exists: true,
    visible: rect.width > 0 && rect.height > 0,
    position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    styles: {
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      backgroundColor: computed.backgroundColor,
      border: computed.border,
      borderRadius: computed.borderRadius,
      boxShadow: computed.boxShadow
    }
  };
}

// Verification functions for each component
const verificationTests = {
  async verifyExperienceCard() {
    const cards = document.querySelectorAll('article');
    const results = [];
    
    cards.forEach((card, index) => {
      const computed = window.getComputedStyle(card);
      const image = card.querySelector('img');
      const stars = card.querySelectorAll('span').filter(s => s.textContent === '★');
      const priceElement = card.querySelector('[class*="price"], [style*="font-weight"]');
      
      results.push({
        index,
        hasImage: !!image && image.complete,
        hasRating: stars.length > 0,
        hasPrice: !!priceElement,
        styles: {
          backgroundColor: computed.backgroundColor,
          border: computed.border,
          borderRadius: computed.borderRadius,
          boxShadow: computed.boxShadow
        },
        issues: []
      });
      
      // Check for issues
      if (computed.backgroundColor === 'rgba(0, 0, 0, 0)') {
        results[index].issues.push('Transparent background');
      }
      if (computed.border === '0px none rgb(0, 0, 0)') {
        results[index].issues.push('No border');
      }
      if (computed.boxShadow === 'none') {
        results[index].issues.push('No shadow');
      }
    });
    
    return {
      component: 'ExperienceCard',
      count: cards.length,
      results,
      status: results.every(r => r.issues.length === 0) ? 'PASS' : 'FAIL'
    };
  },
  
  async verifyPillButton() {
    // Look for pill button components
    const buttons = document.querySelectorAll('[class*="pill"], button[style*="border-radius"]');
    return {
      component: 'PillButton',
      count: buttons.length,
      status: buttons.length > 0 ? 'PASS' : 'NOT_FOUND'
    };
  },
  
  async verifySearchBar() {
    // Look for search input
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="검색"], input[placeholder*="Search"]');
    return {
      component: 'SearchBar',
      count: searchInputs.length,
      status: searchInputs.length > 0 ? 'PASS' : 'NOT_FOUND'
    };
  },
  
  async verifyNavigationBar() {
    // Look for navigation
    const nav = document.querySelector('nav, header');
    return {
      component: 'NavigationBar',
      count: nav ? 1 : 0,
      status: nav ? 'PASS' : 'NOT_FOUND'
    };
  }
};

// Export results
console.log('Visual Verification Results:', verificationResults);

// Return for Playwright
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    componentChecklist,
    verificationResults,
    verificationTests,
    checkElementVisibility
  };
}