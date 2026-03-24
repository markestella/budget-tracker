'use client';

import type { HTMLMotionProps } from 'framer-motion';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface ScaleInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  duration = 0.3,
  ...props
}: ScaleInProps) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className={cn(className)}
      initial={{ opacity: 0, scale: 0 }}
      transition={{ delay, duration, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}