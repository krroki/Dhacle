import React, { useState, useCallback, memo } from 'react';
import { colors } from '@/styles/tokens/colors';
import { effects } from '@/styles/tokens/effects';
import { typography } from '@/styles/tokens/typography';

// Type definitions
export interface ExperienceCardProps {
  id: string;
  image: string;
  imageAlt: string;
  title: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency?: string;
  tags?: string[];
  badge?: string;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onClick?: (id: string) => void;
  loading?: 'lazy' | 'eager';
}

// Rating stars component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} style={{ color: colors.semantic.success }}>★</span>
      ))}
      {hasHalfStar && (
        <span key="half" className="relative">
          <span style={{ color: colors.neutral[300] }}>★</span>
          <span className="absolute inset-0 overflow-hidden w-1/2" style={{ color: colors.semantic.success }}>★</span>
        </span>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} style={{ color: colors.neutral[300] }}>★</span>
      ))}
    </div>
  );
};

// Main component with memo for performance
export const ExperienceCard = memo<ExperienceCardProps>(({
  id,
  image,
  imageAlt,
  title,
  rating,
  reviewCount,
  price,
  currency = '₩',
  tags = [],
  badge,
  isSaved = false,
  onSave,
  onClick,
  loading = 'lazy'
}) => {
  const [saved, setSaved] = useState(isSaved);
  const [imageError, setImageError] = useState(false);

  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(prev => !prev);
    onSave?.(id);
  }, [id, onSave]);

  const handleCardClick = useCallback(() => {
    onClick?.(id);
  }, [id, onClick]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  return (
    <article
      onClick={handleCardClick}
      className="relative flex flex-col overflow-hidden cursor-pointer transition-all group"
      aria-label={title}
      style={{
        borderRadius: effects.borderRadius?.lg || '12px',
        backgroundColor: colors.neutral?.[0] || '#ffffff',
        border: `1px solid ${colors.neutral?.[200] || '#e5e7eb'}`,
        boxShadow: effects.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transitionDuration: effects.animation?.duration?.normal || '200ms',
        transitionTimingFunction: effects.animation?.easing?.smooth || 'cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'scale(1.02)';
        el.style.boxShadow = effects.shadows?.hover || '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'scale(1)';
        el.style.boxShadow = effects.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      }}
    >
      {/* Image Container */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9', backgroundColor: colors.neutral[100] }}>
        <img
          src={imageError ? '/images/placeholder.svg' : image}
          alt={imageAlt}
          loading={loading}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform"
          style={{
            transitionDuration: effects.animation.duration.slow,
            transitionTimingFunction: effects.animation.easing.smooth,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLImageElement).style.transform = 'scale(1)';
          }}
        />
        
        {/* Image Overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: '40%',
            background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7))',
          }}
        />
        
        {/* Badge */}
        {badge && (
          <div
            className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold z-10"
            style={{
              backgroundColor: colors.semantic.warning,
              color: colors.neutral[900],
              borderRadius: effects.borderRadius.sm,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {badge}
          </div>
        )}
        
        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          aria-label={saved ? '저장됨' : '저장'}
          type="button"
          className="absolute top-3 right-3 w-9 h-9 rounded-full border-0 flex items-center justify-center cursor-pointer transition-all z-10"
          style={{
            backgroundColor: colors.neutral[0],
            boxShadow: effects.shadows.sm,
            transitionDuration: effects.animation.duration.fast,
            transitionTimingFunction: effects.animation.easing.smooth,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary.light;
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.neutral[0];
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            style={{
              fill: saved ? colors.semantic.error : 'none',
              stroke: saved ? colors.semantic.error : colors.neutral[600],
              strokeWidth: 2,
              transition: `all ${effects.animation.duration.fast} ${effects.animation.easing.smooth}`,
            }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3
          className="m-0 overflow-hidden"
          style={{
            fontSize: typography.fontSize.bodyLarge,
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            lineHeight: typography.lineHeight.snug,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </h3>
        
        <div className="flex items-center gap-1">
          <StarRating rating={rating} />
          <span
            className="ml-1"
            style={{
              fontSize: typography.fontSize.small,
              color: colors.neutral[600],
            }}
          >
            ({reviewCount.toLocaleString()})
          </span>
        </div>
        
        <div className="flex items-baseline gap-1 mt-auto">
          <span
            style={{
              fontSize: typography.fontSize.h3,
              fontWeight: typography.fontWeight.bold,
              color: colors.neutral[900],
            }}
          >
            {currency}{formatPrice(price)}
          </span>
          <span
            style={{
              fontSize: typography.fontSize.small,
              color: colors.neutral[600],
            }}
          >
            부터
          </span>
        </div>
        
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1"
                style={{
                  backgroundColor: colors.neutral[100],
                  color: colors.neutral[700],
                  borderRadius: effects.borderRadius.pill,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
});

ExperienceCard.displayName = 'ExperienceCard';

export default ExperienceCard;