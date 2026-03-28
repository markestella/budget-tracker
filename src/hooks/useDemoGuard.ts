'use client';

import { toast } from 'sonner';
import { useDemo } from '@/components/providers/DemoProvider';

/**
 * Returns a guard function. Call it before any mutation.
 * Returns `true` if the mutation is allowed, `false` if blocked (demo mode).
 */
export function useDemoGuard() {
  const { isDemo } = useDemo();

  return () => {
    if (isDemo) {
      toast.info('This is a demo — sign up to save your data!', {
        action: {
          label: 'Sign Up',
          onClick: () => {
            window.location.href = '/register';
          },
        },
      });
      return false;
    }
    return true;
  };
}
