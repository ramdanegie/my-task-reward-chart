'use client';
import useSWR from 'swr';
import { jsonFetcher } from './api';
import type { PocketWithBalance } from '@/domain/types';

export interface ChildMe {
  child: { id: string; name: string; avatar: string; dailyPointTarget: number; weeklyPointTarget: number };
  tasks: { id: string; title: string; category: string; point: number; requiresApproval: boolean }[];
  logs: { id: string; taskId: string; status: string; earnedPoint: number }[];
  rewards: { id: string; title: string; description: string; requiredPoint: number }[];
  pockets: PocketWithBalance[];
  total: number;
  today: string;
  weekPoints: number;
  weekSeries: { label: string; points: number }[];
}

export function useChildMe() {
  return useSWR<ChildMe>('/api/child/me', jsonFetcher);
}
