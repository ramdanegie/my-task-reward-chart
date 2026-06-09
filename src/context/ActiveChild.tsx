'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useChildren, type ChildDTO } from '@/lib/hooks';

interface Ctx {
  children: ChildDTO[];
  activeChildId: string | null;
  activeChild: ChildDTO | null;
  setActiveChildId: (id: string) => void;
  isLoading: boolean;
  refresh: () => void;
}
const ActiveChildContext = createContext<Ctx | null>(null);

export function ActiveChildProvider({ children: kids }: { children: React.ReactNode }) {
  const { data, isLoading, mutate } = useChildren();
  const [activeChildId, setId] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.length) return;
    const stored = localStorage.getItem('activeChildId');
    const valid = data.find((c) => c.id === stored);
    setId(valid ? stored : data[0].id);
  }, [data]);

  const setActiveChildId = (id: string) => {
    setId(id);
    localStorage.setItem('activeChildId', id);
  };

  return (
    <ActiveChildContext.Provider value={{
      children: data ?? [],
      activeChildId,
      activeChild: data?.find((c) => c.id === activeChildId) ?? null,
      setActiveChildId, isLoading, refresh: () => mutate(),
    }}>
      {kids}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild() {
  const ctx = useContext(ActiveChildContext);
  if (!ctx) throw new Error('useActiveChild must be used within ActiveChildProvider');
  return ctx;
}
