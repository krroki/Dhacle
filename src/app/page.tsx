'use client'

import { useTheme } from '@/lib/theme/ThemeProvider'
import NavigationBar from '@/components/NavigationBar'
import { TopBanner } from '@/components/sections/TopBanner'
import { MainCarousel } from '@/components/sections/MainCarousel'
import { CategoryGrid } from '@/components/sections/CategoryGrid'
import { RevenueSlider } from '@/components/sections/RevenueSlider'

export default function Home() {
  const { theme } = useTheme();
  
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top Banner - FastCampus Style */}
      <TopBanner />
      
      {/* Navigation Bar */}
      <NavigationBar 
        currentPath="/"
        isLoggedIn={false}
        onLogin={() => console.log('Login clicked')}
      />
      
      {/* Main Carousel - Hero Section Replacement */}
      <MainCarousel />
      
      {/* Category Grid */}
      <CategoryGrid />
      
      {/* Revenue Slider */}
      <RevenueSlider />
    </div>
  );
}