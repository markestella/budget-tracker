'use client';

import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface SlideUpProps extends HTMLMotionProps<'div'> {
  delay?: number;
  distance?: number;
}

export function SlideUp({
  children,
  className,
  delay = 0,
  distance = 24,
  ...props
}: SlideUpProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(className)}
      initial={{ opacity: 0, y: distance }}
      transition={{
        delay,
        stiffness: 180,
        damping: 20,
        mass: 0.9,
        type: 'spring',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}