"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface LiquidMorphingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'gradient' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

const LiquidMorphingButton: React.FC<LiquidMorphingButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [liquidPosition, setLiquidPosition] = useState({ x: 50, y: 50 });
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setLiquidPosition({ x, y });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const newRipple = { x, y, id: Date.now() };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 1000);
    }

    onClick?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #635BFF 0%, #4F46E5 100%)',
          color: '#ffffff',
          border: 'none',
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, #00D68F 0%, #00BA74 100%)',
          color: '#ffffff',
          border: 'none',
        };
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #635BFF 0%, #00D68F 50%, #FFC450 100%)',
          color: '#ffffff',
          border: 'none',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: theme.colors.text.primary.default,
          border: '1px solid rgba(99, 91, 255, 0.3)',
        };
      default:
        return {};
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => {
        setIsPressed(false);
        setLiquidPosition({ x: 50, y: 50 });
      }}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden rounded-full font-medium
        transition-all duration-300 transform
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
      style={{
        ...getVariantStyles(),
        transform: isPressed ? 'scale(0.95)' : undefined,
      }}
    >
      {/* Liquid Background Layer */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ filter: 'url(#liquid-filter)' }}
        >
          <defs>
            <filter id="liquid-filter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01"
                numOctaves="2"
                result="turbulence"
              />
              <feColorMatrix
                in="turbulence"
                type="saturate"
                values="2"
              />
              <feGaussianBlur stdDeviation="2" />
              <feComponentTransfer>
                <feFuncA type="discrete" tableValues="0 .5 .5 .5 .5 .5 .5 .5 .5 1" />
              </feComponentTransfer>
            </filter>
          </defs>
          
          {/* Morphing Liquid Shape */}
          <ellipse
            cx={`${liquidPosition.x}%`}
            cy={`${liquidPosition.y}%`}
            rx={isPressed ? "60%" : "40%"}
            ry={isPressed ? "60%" : "40%"}
            fill="rgba(255, 255, 255, 0.1)"
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'liquid-morph 3s ease-in-out infinite',
            }}
          />
        </svg>

        {/* Liquid Gradient Overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${liquidPosition.x}% ${liquidPosition.y}%, 
              rgba(255, 255, 255, 0.4) 0%, 
              transparent 70%)`,
            transition: 'all 0.2s ease-out',
          }}
        />
      </div>

      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 70%)',
            animation: 'liquid-ripple 1s ease-out forwards',
          }}
        />
      ))}

      {/* Shimmer Effect */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, 
            transparent 40%, 
            rgba(255, 255, 255, 0.4) 50%, 
            transparent 60%)`,
          transform: 'translateX(-100%)',
          animation: 'liquid-shimmer 1.5s ease-in-out infinite',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </span>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes liquid-morph {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(5deg);
          }
          50% {
            transform: scale(0.9) rotate(-5deg);
          }
          75% {
            transform: scale(1.05) rotate(3deg);
          }
        }

        @keyframes liquid-ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }

        @keyframes liquid-shimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </button>
  );
};

export default LiquidMorphingButton;