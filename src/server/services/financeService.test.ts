import { describe, it, expect } from 'vitest';
import { computeBalance, buildTransferPair } from './financeService';

describe('financeService', () => {
  it('computes balance = initial + credits - debits', () => {
    const txns = [
      { amount: 50000, txnType: 'credit' },
      { amount: 20000, txnType: 'debit' },
      { amount: 10000, txnType: 'credit' },
    ];
    expect(computeBalance(100000, txns)).toBe(140000);
  });

  it('builds a paired transfer (debit source, credit target) sharing a group id', () => {
    const pair = buildTransferPair('p1', 'p2', 30000, 'pindah ke investasi');
    expect(pair).toHaveLength(2);
    expect(pair[0]).toMatchObject({ pocketId: 'p1', amount: 30000, txnType: 'debit', source: 'transfer' });
    expect(pair[1]).toMatchObject({ pocketId: 'p2', amount: 30000, txnType: 'credit', source: 'transfer' });
    expect(pair[0].transferGroupId).toBe(pair[1].transferGroupId);
    expect(pair[0].transferGroupId).toBeTruthy();
  });
});
