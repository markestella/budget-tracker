'use client';

import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.35,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={cn(className)}
      initial={{ opacity: 0 }}
      transition={{ delay, duration, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}