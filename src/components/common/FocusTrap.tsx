'use client'

import { useEffect, useRef } from 'react'

interface FocusTrapProps {
  isActive: boolean
  children: React.ReactNode
  returnFocusOnDeactivate?: boolean
  initialFocus?: string
  onEscape?: () => void
}

export function FocusTrap({
  isActive,
  children,
  returnFocusOnDeactivate = true,
  initialFocus,
  onEscape,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    // 이전에 포커스된 요소 저장
    previouslyFocusedElement.current = document.activeElement as HTMLElement

    // 포커스 가능한 요소들 찾기
    const getFocusableElements = () => {
      const selectors = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ')

      return Array.from(container.querySelectorAll<HTMLElement>(selectors))
        .filter((el) => {
          // 실제로 보이는 요소만 필터링
          const style = window.getComputedStyle(el)
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            el.offsetWidth > 0 &&
            el.offsetHeight > 0
          )
        })
    }

    // 초기 포커스 설정
    const setInitialFocus = () => {
      const focusableElements = getFocusableElements()
      
      if (initialFocus) {
        const targetElement = container.querySelector<HTMLElement>(initialFocus)
        if (targetElement) {
          targetElement.focus()
          return
        }
      }

      if (focusableElements.length > 0 && focusableElements[0]) {
        focusableElements[0].focus()
      }
    }

    // 키보드 이벤트 처리
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape()
        return
      }

      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (e.shiftKey) {
        // Shift + Tab
        if (activeElement === firstElement && lastElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (activeElement === lastElement && firstElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    // 포커스가 트랩 밖으로 나가는 것 방지
    const handleFocusIn = (e: FocusEvent) => {
      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const target = e.target as HTMLElement
      if (!container.contains(target) && focusableElements[0]) {
        e.preventDefault()
        focusableElements[0].focus()
      }
    }

    // 초기 포커스 설정
    setTimeout(setInitialFocus, 0)

    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)

      // 이전 포커스로 복귀
      if (returnFocusOnDeactivate && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [isActive, initialFocus, onEscape, returnFocusOnDeactivate])

  return (
    <div ref={containerRef} data-focus-trap={isActive}>
      {children}
    </div>
  )
}