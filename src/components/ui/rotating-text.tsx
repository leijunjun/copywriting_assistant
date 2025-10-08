/**
 * Rotating Text Animation Component
 * Based on https://reactbits.dev/text-animations/rotating-text
 */

'use client';

import React, { useState, useEffect } from 'react';

interface RotatingTextProps {
  words: string[];
  className?: string;
  duration?: number;
  delay?: number;
}

export function RotatingText({ 
  words, 
  className = '', 
  duration = 3000,
  delay = 100 
}: RotatingTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => 
          (prevIndex + 1) % words.length
        );
        setIsVisible(true);
      }, delay);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration, delay]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className={`inline-block transition-all duration-500 ease-in-out ${
          isVisible 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-4'
        }`}
        style={{
          minHeight: '1.2em', // 防止高度变化
        }}
      >
        {words[currentWordIndex]}
      </span>
    </div>
  );
}

// 增强版旋转文字组件，支持更丰富的动画效果
export function EnhancedRotatingText({ 
  words, 
  className = '', 
  duration = 3000,
  delay = 100,
  animationType = 'fade' // 'fade' | 'slide' | 'scale' | 'rotate'
}: RotatingTextProps & { animationType?: 'fade' | 'slide' | 'scale' | 'rotate' }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => 
          (prevIndex + 1) % words.length
        );
        setIsVisible(true);
      }, delay);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration, delay]);

  const getAnimationClasses = () => {
    switch (animationType) {
      case 'slide':
        return isVisible 
          ? 'opacity-100 transform translate-x-0' 
          : 'opacity-0 transform translate-x-8';
      case 'scale':
        return isVisible 
          ? 'opacity-100 transform scale-100' 
          : 'opacity-0 transform scale-95';
      case 'rotate':
        return isVisible 
          ? 'opacity-100 transform rotate-0' 
          : 'opacity-0 transform rotate-12';
      default: // fade
        return isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className={`inline-block transition-all duration-500 ease-in-out ${getAnimationClasses()}`}
        style={{
          minHeight: '1.2em',
        }}
      >
        {words[currentWordIndex]}
      </span>
    </div>
  );
}

// 渐变旋转文字组件，支持渐变背景
export function GradientRotatingText({ 
  words, 
  className = '', 
  duration = 3000,
  delay = 100,
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-purple-600'
}: RotatingTextProps & { 
  gradientFrom?: string;
  gradientTo?: string;
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => 
          (prevIndex + 1) % words.length
        );
        setIsVisible(true);
      }, delay);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration, delay]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className={`inline-block transition-all duration-500 ease-in-out bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent ${
          isVisible 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-4'
        }`}
        style={{
          minHeight: '1.2em',
        }}
      >
        {words[currentWordIndex]}
      </span>
    </div>
  );
}
