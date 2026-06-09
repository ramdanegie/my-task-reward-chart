'use client';
import useSWR from 'swr';
import { jsonFetcher } from './api';
import type { ChildSummary, PocketWithBalance, RangeType } from '@/domain/types';

export interface ChildDTO {
  id: string; name: string; age: number; avatar: string;
  dailyPointTarget: number; weeklyPointTarget: number; accessCode: string; isActive: boolean;
}

export function useChildren() {
  return useSWR<ChildDTO[]>('/api/children', jsonFetcher);
}
export function useTasks(childId?: string) {
  return useSWR(childId ? `/api/children/${childId}/tasks` : null, jsonFetcher);
}
export function useRewards(childId?: string) {
  return useSWR(childId ? `/api/children/${childId}/rewards` : null, jsonFetcher);
}
export function useLogs(childId: string | undefined, date: string) {
  return useSWR(childId ? `/api/children/${childId}/logs?date=${date}` : null, jsonFetcher);
}
export function useSummary(childId: string | undefined, range: RangeType, date: string) {
  return useSWR<{ range: RangeType; start: string; end: string; summary: ChildSummary }>(
    childId ? `/api/children/${childId}/summary?range=${range}&date=${date}` : null, jsonFetcher);
}
export function usePockets(childId?: string) {
  return useSWR<{ pockets: PocketWithBalance[]; total: number }>(
    childId ? `/api/children/${childId}/pockets` : null, jsonFetcher);
}
export function useTransactions(childId: string | undefined, start?: string, end?: string) {
  const qs = start && end ? `?start=${start}&end=${end}` : '';
  return useSWR(childId ? `/api/children/${childId}/transactions${qs}` : null, jsonFetcher);
}
export function useNotes(childId?: string) {
  return useSWR(childId ? `/api/children/${childId}/notes` : null, jsonFetcher);
}
export function useClaims(childId?: string) {
  return useSWR(childId ? `/api/children/${childId}/claims` : null, jsonFetcher);
}
