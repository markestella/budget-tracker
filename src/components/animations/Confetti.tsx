'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

const defaultColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

interface ConfettiProps {
  className?: string;
  colors?: string[];
  duration?: number;
  particleCount?: number;
  trigger?: boolean;
}

export function Confetti({
  className,
  colors = defaultColors,
  duration = 1400,
  particleCount = 24,
  trigger = true,
}: ConfettiProps) {
  if (!trigger) {
    return null;
  }

  const particles = Array.from({ length: particleCount }, (_, index) => {
    const angle = (index / particleCount) * Math.PI * 2;
    const distance = 56 + (index % 6) * 18;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance - 18;
    const rotate = index % 2 === 0 ? 220 : -220;
    const size = 6 + (index % 4) * 2;

    return {
      color: colors[index % colors.length],
      id: index,
      rotate,
      size,
      x,
      y,
    };
  });

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-visible', className)}>
      <div className="absolute left-1/2 top-1/2">
        {particles.map((particle) => (
          <motion.span
            animate={{
              opacity: [1, 1, 0],
              rotate: particle.rotate,
              scale: [0.9, 1, 0.8],
              x: particle.x,
              y: particle.y,
            }}
            className="absolute rounded-full"
            initial={{ opacity: 0, rotate: 0, scale: 0, x: 0, y: 0 }}
            key={particle.id}
            style={{
              backgroundColor: particle.color,
              height: `${particle.size}px`,
              width: `${particle.size}px`,
            }}
            transition={{
              delay: particle.id * 0.01,
              duration: duration / 1000,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}