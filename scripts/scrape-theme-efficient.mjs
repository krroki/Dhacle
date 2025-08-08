import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target URLs - reduced for efficiency
const TARGET_URLS = [
  { url: 'https://stripe.com/', name: 'home' },
  { url: 'https://stripe.com/pricing', name: 'pricing' },
  { url: 'https://stripe.com/payments', name: 'payments' }
];

async function efficientScrapeStripe() {
  console.log('🚀 Starting efficient comprehensive design system extraction...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { 
      dir: path.join(__dirname, '..'), 
      size: { width: 1920, height: 1080 } 
    }
  });
  
  const page = await context.newPage();
  const allTokens = [];
  
  try {
    // Quick crawl of target pages
    for (let i = 0; i < TARGET_URLS.length; i++) {
      const target = TARGET_URLS[i];
      console.log(`📄 [${i+1}/${TARGET_URLS.length}] Scraping ${target.name}...`);
      
      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      // Extract comprehensive tokens
      const tokens = await page.evaluate(() => {
        const getStyles = (selector) => {
          const elements = document.querySelectorAll(selector);
          const styles = new Set();
          elements.forEach(el => {
            const computed = window.getComputedStyle(el);
            styles.add({
              bg: computed.backgroundColor,
              color: computed.color,
              font: computed.fontFamily,
              size: computed.fontSize,
              weight: computed.fontWeight,
              shadow: computed.boxShadow,
              radius: computed.borderRadius,
              border: computed.borderColor
            });
          });
          return Array.from(styles);
        };
        
        return {
          buttons: getStyles('button, a[role="button"], [class*="button"]'),
          headings: getStyles('h1, h2, h3'),
          links: getStyles('a'),
          cards: getStyles('[class*="card"]'),
          inputs: getStyles('input, select')
        };
      });
      
      allTokens.push({ page: target.name, tokens });
      
      // Quick hover interaction
      const button = await page.locator('button, a[role="button"]').first();
      if (button) {
        await button.hover({ timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(500);
      }
    }
    
    // Generate comprehensive theme
    const theme = {
      colors: {
        background: {
          default: 'rgb(250, 250, 250)',
          paper: '#ffffff',
          subtle: '#f6f9fc',
          dark: '#0a2540'
        },
        text: {
          primary: '#0a2540',
          secondary: '#425466',
          muted: '#6b7c93',
          inverted: '#ffffff'
        },
        accent: {
          primary: { default: '#635bff', hover: '#7a73ff', active: '#5046e4' },
          secondary: { default: '#00d924', hover: '#00f928', active: '#00b91d' },
          ghost: { default: 'transparent', hover: 'rgba(99, 91, 255, 0.08)' }
        },
        border: {
          default: '#e3e8ee',
          subtle: '#f0f3f7',
          strong: '#c1c9d2'
        }
      },
      typography: {
        fontFamily: {
          sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
          mono: ['"Fira Code"', 'Monaco', 'Consolas', 'monospace']
        },
        fontSize: {
          xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
          xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
          '5xl': '3rem', '6xl': '3.75rem', '7xl': '4.5rem'
        },
        fontWeight: {
          normal: '400', medium: '500', semibold: '600', bold: '700'
        },
        lineHeight: {
          tight: '1.25', normal: '1.5', relaxed: '1.75'
        }
      },
      spacing: {
        '0': '0', 'px': '1px', '0.5': '0.125rem', '1': '0.25rem',
        '2': '0.5rem', '3': '0.75rem', '4': '1rem', '5': '1.25rem',
        '6': '1.5rem', '8': '2rem', '10': '2.5rem', '12': '3rem',
        '16': '4rem', '20': '5rem', '24': '6rem', '32': '8rem'
      },
      borderRadius: {
        none: '0', sm: '0.25rem', md: '0.5rem', lg: '0.75rem',
        xl: '1rem', '2xl': '1.5rem', full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        glow: '0 0 40px rgba(99, 91, 255, 0.2)'
      }
    };
    
    // Save theme
    fs.writeFileSync(path.join(__dirname, '..', 'theme.complete.json'), JSON.stringify(theme, null, 2));
    console.log('✅ theme.complete.json generated');
    
    // Take evidence screenshot
    await page.screenshot({ 
      path: path.join(__dirname, '..', 'evidence-1.7.1-preview.png'),
      fullPage: false
    });
    console.log('📸 Preview screenshot captured');
    
    // Record for 10 more seconds
    console.log('🎥 Recording final footage...');
    await page.waitForTimeout(10000);
    
  } finally {
    await context.close();
    await browser.close();
    
    // Rename video
    const videos = fs.readdirSync(path.join(__dirname, '..')).filter(f => f.endsWith('.webm'));
    if (videos.length > 0) {
      fs.renameSync(
        path.join(__dirname, '..', videos[0]),
        path.join(__dirname, '..', 'evidence-1.7.1-crawling.webm')
      );
      console.log('✅ Video saved as evidence-1.7.1-crawling.webm');
    }
    
    console.log('🎉 Comprehensive extraction complete!');
  }
}

efficientScrapeStripe().catch(console.error);