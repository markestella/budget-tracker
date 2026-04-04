'use client';

import React, { createContext, useContext } from 'react';

interface DemoContextValue {
  isDemo: boolean;
  guardMutation: () => boolean;
}

const DemoContext = createContext<DemoContextValue>({
  isDemo: false,
  guardMutation: () => true,
});

export function useDemo() {
  return useContext(DemoContext);
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const guardMutation = () => {
    return false;
  };

  return (
    <DemoContext.Provider value={{ isDemo: true, guardMutation }}>
      {children}
    </DemoContext.Provider>
  );
}
