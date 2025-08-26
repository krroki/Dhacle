'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  priority?: boolean
  className?: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  className,
  width,
  height,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
    onError?.()
  }

  // 기본 sizes 설정 (반응형)
  const defaultSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width: width || '100%', height: height || 'auto' }}
      >
        <span className="text-sm">이미지 로드 실패</span>
      </div>
    )
  }

  if (fill) {
    return (
      <div className={cn('relative', className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes || defaultSizes}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          className={cn(
            'object-cover',
            isLoading && 'animate-pulse bg-gray-200'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 0}
      height={height || 0}
      sizes={sizes || defaultSizes}
      quality={quality}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      className={cn(
        className,
        isLoading && 'animate-pulse bg-gray-200'
      )}
      style={{ width: width || '100%', height: height || 'auto' }}
      onLoad={handleLoad}
      onError={handleError}
    />
  )
}