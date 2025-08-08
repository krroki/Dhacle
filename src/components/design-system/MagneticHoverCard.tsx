"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface MagneticHoverCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  gradient?: boolean;
  glow?: boolean;
}

const MagneticHoverCard: React.FC<MagneticHoverCardProps> = ({
  children,
  className = "",
  intensity = 1,
  gradient = true,
  glow = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const { theme } = useTheme();

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      
      // Calculate rotation based on mouse position
      const rotateX = (distanceY / (rect.height / 2)) * -10 * intensity;
      const rotateY = (distanceX / (rect.width / 2)) * 10 * intensity;
      
      // Calculate translation for magnetic effect
      const translateX = (distanceX / (rect.width / 2)) * 5 * intensity;
      const translateY = (distanceY / (rect.height / 2)) * 5 * intensity;
      
      // Calculate relative position for gradient
      const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
      const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
      
      setTransform({
        rotateX,
        rotateY,
        x: translateX,
        y: translateY,
      });
      
      setMousePosition({ x: relativeX, y: relativeY });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      document.addEventListener('mousemove', handleMouseMove);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setTransform({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
      setMousePosition({ x: 50, y: 50 });
      document.removeEventListener('mousemove', handleMouseMove);
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity]);

  return (
    <div
      ref={cardRef}
      className={`relative group cursor-pointer ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translateX(${transform.x}px) translateY(${transform.y}px) translateZ(${isHovered ? 10 : 0}px)`,
        transition: isHovered 
          ? 'none' 
          : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Main Card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
        style={{
          boxShadow: isHovered
            ? `
                0 10px 40px -10px rgba(0, 0, 0, 0.2),
                0 0 50px -20px rgba(99, 91, 255, 0.3),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1)
              `
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Gradient Overlay */}
        {gradient && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, 
                rgba(99, 91, 255, 0.15) 0%, 
                rgba(0, 214, 143, 0.1) 25%, 
                transparent 50%)`,
              transition: 'opacity 0.3s ease',
            }}
          />
        )}

        {/* Glow Effect */}
        {glow && isHovered && (
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(400px circle at ${mousePosition.x}% ${mousePosition.y}%, 
                rgba(255, 255, 255, 0.3) 0%, 
                transparent 50%)`,
              filter: 'blur(40px)',
            }}
          />
        )}

        {/* Shine Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: `linear-gradient(105deg, 
              transparent 40%, 
              rgba(255, 255, 255, 0.7) 50%, 
              transparent 60%)`,
            transform: isHovered 
              ? `translateX(${mousePosition.x - 50}%) translateY(${mousePosition.y - 50}%)`
              : 'translateX(-100%) translateY(-100%)',
            transition: 'opacity 0.3s ease, transform 0.5s ease',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Border Glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: `linear-gradient(${mousePosition.x * 3.6}deg, 
              rgba(99, 91, 255, 0.5) 0%, 
              rgba(0, 214, 143, 0.5) 50%, 
              rgba(255, 196, 80, 0.5) 100%)`,
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6">
          {children}
        </div>

        {/* 3D Shadow */}
        <div
          className="absolute -bottom-4 left-4 right-4 h-8 rounded-2xl opacity-20 blur-xl"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.5))',
            transform: `translateZ(-20px) rotateX(${-transform.rotateX}deg)`,
            transition: isHovered 
              ? 'none' 
              : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
};

export default MagneticHoverCard;