'use client';

import * as React from 'react';
import { Switch as SwitchPrimitive } from '@base-ui/react/switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<HTMLButtonElement, SwitchPrimitive.Root.Props>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent bg-slate-300 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[checked]:bg-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 dark:bg-slate-700',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[checked]:translate-x-[1.35rem]" />
    </SwitchPrimitive.Root>
  );
});

export { Switch };