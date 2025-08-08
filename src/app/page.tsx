'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowRight, Check, Star, Menu, X } from 'lucide-react'
import { 
  StripeButton, 
  StripeCard, 
  StripeTypography, 
  StripeGradient,
  StripeNavigation 
} from '@/components/design-system'
import { StripeSection, StripeContainer } from '@/components/design-system/StripeSection'
import { useTheme } from '@/lib/theme/ThemeProvider'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const theme = useTheme();
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.theme.colors.neutral.white }}>
      {/* Navigation using Design System */}
      <StripeNavigation 
        logo="쇼츠 스튜디오"
        links={[
          { href: '#', label: '툴박스' },
          { href: '#', label: '자료실' },
          { href: '#', label: '커뮤니티' }
        ]}
        ctaText="무료로 시작하기"
      />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-white md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="pt-20 px-6">
              <div className="flex flex-col space-y-4">
                <a href="#" className="text-gray-900 text-lg font-medium">툴박스</a>
                <a href="#" className="text-gray-900 text-lg font-medium">자료실</a>
                <a href="#" className="text-gray-900 text-lg font-medium">커뮤니티</a>
                <button className="text-gray-700 text-lg font-medium text-left">로그인</button>
                <button className="w-full py-3 bg-stripe-blue hover:bg-stripe-blue-hover text-white font-medium rounded-full">
                  무료로 시작하기
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Using Design System */}
      <StripeSection variant="default" padding="xl">
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 20% 50%, ${theme.theme.colors.primary.blue.default}08 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, ${theme.theme.colors.primary.lightBlue}08 0%, transparent 50%)`
        }} />
        
        <StripeContainer size="xl">
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <StripeTypography variant="h1" color="dark">
              쇼츠 제작의 모든 과정,
              <br />
              <span style={{
                background: `linear-gradient(to right, ${theme.theme.colors.primary.blue.default}, ${theme.theme.colors.primary.lightBlue})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                AI로 스마트하게
              </span>
            </StripeTypography>
            
            <div style={{ marginTop: theme.theme.spacing[6] }}>
              <StripeTypography variant="body" color="primary">
                귀찮은 자막 작업부터 수익화 전략까지, 모든 것을 한 곳에서
              </StripeTypography>
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: theme.theme.spacing[4], 
              justifyContent: 'center',
              marginTop: theme.theme.spacing[10]
            }}>
              <StripeButton variant="primary" size="lg" icon={<ArrowRight size={20} />}>
                툴박스 무료로 사용하기
              </StripeButton>
              
              <StripeButton variant="secondary" size="lg">
                더 알아보기
              </StripeButton>
            </div>
          </motion.div>

          </div>
        </StripeContainer>
      </StripeSection>

      {/* Social Proof Section - Using Design System */}
      <StripeSection variant="subtle" padding="lg">
        <StripeContainer>
          <motion.div
            style={{ textAlign: 'center', marginBottom: theme.theme.spacing[16] }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <StripeTypography variant="h2" color="dark">
              디하클 공식 카페 회원 15,000명이 함께합니다
            </StripeTypography>
            <div style={{ marginTop: theme.theme.spacing[4] }}>
              <StripeTypography variant="body" color="primary">
                국내 최대 쇼츠 크리에이터 커뮤니티
              </StripeTypography>
            </div>
          </motion.div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: theme.theme.spacing[8] 
          }}>
            {['Naver Cafe', 'YouTube Official', 'Creator Awards'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <StripeCard variant="default" elevation="sm" padding="md">
                  <StripeTypography variant="body" color="primary">
                    {item}
                  </StripeTypography>
                </StripeCard>
              </motion.div>
            ))}
          </div>
        </StripeContainer>
      </StripeSection>

      {/* Features Section - Using Design System */}
      <StripeSection variant="default" padding="xl">
        <StripeContainer>
          {/* Feature 1 */}
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div>
              <StripeGradient variant="primary" className="inline-block p-3 rounded-xl mb-8">
                <span className="text-white text-2xl">✨</span>
              </StripeGradient>
              
              <StripeTypography variant="h2" color="dark" className="mb-6">
                AI 자막 생성기
              </StripeTypography>
              
              <StripeTypography variant="body" color="primary" className="text-xl mb-8 leading-relaxed">
                OpenAI Whisper 기술을 활용한 정확한 한국어 자막 생성.
                <br />무음 구간 자동 제거로 완벽한 타이밍 동기화.
              </StripeTypography>
              
              <div className="space-y-4 mb-8">
                {[
                  '99% 정확도의 음성 인식',
                  '자동 타이밍 동기화',
                  '무음 구간 스마트 제거',
                  'SRT 파일 즉시 다운로드'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <StripeButton variant="primary" icon={<ArrowRight size={18} />}>
                자막 생성 시작하기
              </StripeButton>
            </div>

            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-96 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-stripe-blue/10 to-stripe-blue-hover/10" />
                <span className="text-gray-400 text-lg">Feature Visual</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="relative order-2 md:order-1"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative bg-gradient-to-br from-pink-100 to-orange-100 rounded-2xl h-96 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10" />
                <span className="text-gray-400 text-lg">Feature Visual</span>
              </div>
            </motion.div>

            <div className="order-1 md:order-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl mb-6">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-stripe-darkBlue mb-4">
                수익화 가이드북
              </h3>
              <p className="text-lg text-text-primary mb-8">
                월 천만원 달성한 크리에이터들의 실전 전략을 담은 디지털 가이드북
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  '실전 수익화 전략',
                  '플랫폼별 최적화 가이드',
                  '광고 수익 극대화 방법',
                  '스폰서십 협상 팁'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <button className="px-6 py-3 bg-white border-2 border-stripe-darkBlue hover:bg-gray-50 text-stripe-darkBlue font-semibold rounded-full hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                자세히 알아보기 →
              </button>
            </div>
          </motion.div>
        </StripeContainer>
      </StripeSection>

      {/* Testimonials Section - Using Design System */}
      <StripeSection variant="subtle" padding="lg">
        <StripeContainer>
          <motion.div
            style={{ textAlign: 'center', marginBottom: theme.theme.spacing[12] }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <StripeTypography variant="h2" color="dark">
              크리에이터들의 생생한 후기
            </StripeTypography>
            <div style={{ marginTop: theme.theme.spacing[4] }}>
              <StripeTypography variant="body" color="primary">
                디하클과 함께 성장한 크리에이터들의 이야기
              </StripeTypography>
            </div>
          </motion.div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: theme.theme.spacing[6] 
          }}>
            {[
              {
                name: '김현우',
                role: '구독자 15만 크리에이터',
                content: '자막 작업 시간이 10분의 1로 줄었어요. 덕분에 콘텐츠 제작에만 집중할 수 있게 되었습니다.',
                rating: 5
              },
              {
                name: '이수민',
                role: '쇼츠 전문 크리에이터',
                content: '수익화 가이드북 덕분에 첫 달부터 수익이 3배 늘었습니다. 진짜 실전 팁들이 가득해요!',
                rating: 5
              },
              {
                name: '박지서',
                role: '신규 크리에이터',
                content: '커뮤니티에서 얻은 정보들이 정말 도움이 많이 됐어요. 혼자였다면 못했을 성장입니다.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <StripeCard variant="elevated" padding="lg">
                  <div style={{ display: 'flex', marginBottom: theme.theme.spacing[4] }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={20} style={{ 
                        color: '#FFC107',
                        fill: '#FFC107',
                        marginRight: theme.theme.spacing[1] 
                      }} />
                    ))}
                  </div>
                  
                  <div style={{ marginBottom: theme.theme.spacing[6] }}>
                    <StripeTypography variant="body" color="primary">
                      &ldquo;{testimonial.content}&rdquo;
                    </StripeTypography>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <StripeGradient variant="primary" className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <StripeTypography variant="caption" color="dark">
                        {testimonial.name}
                      </StripeTypography>
                      <StripeTypography variant="caption" color="light">
                        {testimonial.role}
                      </StripeTypography>
                    </div>
                  </div>
                </StripeCard>
              </motion.div>
            ))}
          </div>
        </StripeContainer>
      </StripeSection>

      {/* CTA Section - Using Design System */}
      <StripeSection variant="dark" padding="xl">
        <StripeContainer size="lg">
          <motion.div
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <StripeTypography variant="h1" color="inverse">
              지금 바로 쇼츠 스튜디오와 함께
              <br />
              <span style={{
                background: `linear-gradient(to right, ${theme.theme.colors.primary.lightBlue}, ${theme.theme.colors.neutral.white})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                당신의 채널을 성장시키세요
              </span>
            </StripeTypography>
            
            <div style={{ marginTop: theme.theme.spacing[8], marginBottom: theme.theme.spacing[12] }}>
              <StripeTypography variant="body" color="inverse">
                모든 기능을 무료로 시작할 수 있습니다
              </StripeTypography>
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: theme.theme.spacing[6], 
              justifyContent: 'center' 
            }}>
              <StripeButton variant="secondary" size="lg" icon={<ArrowRight size={20} />}>
                무료로 시작하기
              </StripeButton>
              
              <StripeButton variant="ghost" size="lg">
                자세히 알아보기
              </StripeButton>
            </div>

            <div style={{ 
              marginTop: theme.theme.spacing[12],
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: theme.theme.spacing[8]
            }}>
              {['신용카드 불필요', '언제든 취소 가능', '즉시 시작'].map((item, index) => (
                <motion.div
                  key={index}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: theme.theme.spacing[2] 
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Check size={20} style={{ color: theme.theme.colors.neutral.white }} />
                  <StripeTypography variant="caption" color="inverse">
                    {item}
                  </StripeTypography>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </StripeContainer>
      </StripeSection>
    </div>
  )
}