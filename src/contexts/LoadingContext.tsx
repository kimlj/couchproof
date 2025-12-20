'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isDataLoading: boolean;
  setDataLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isDataLoading: true,
  setDataLoading: () => {},
});

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isDataLoading, setIsDataLoading] = useState(true);

  return (
    <LoadingContext.Provider value={{ isDataLoading, setDataLoading: setIsDataLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
