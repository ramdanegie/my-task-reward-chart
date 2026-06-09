import { randomUUID } from 'node:crypto';

interface BalanceTxn { amount: number; txnType: string }

export function computeBalance(initialBalance: number, txns: BalanceTxn[]): number {
  return txns.reduce(
    (bal, t) => bal + (t.txnType === 'credit' ? t.amount : -t.amount),
    initialBalance,
  );
}

export interface TransferTxnInput {
  pocketId: string;
  amount: number;
  txnType: 'credit' | 'debit';
  source: 'transfer';
  note?: string;
  transferGroupId: string;
}

export function buildTransferPair(
  fromPocketId: string,
  toPocketId: string,
  amount: number,
  note?: string,
): [TransferTxnInput, TransferTxnInput] {
  const transferGroupId = randomUUID();
  return [
    { pocketId: fromPocketId, amount, txnType: 'debit', source: 'transfer', note, transferGroupId },
    { pocketId: toPocketId, amount, txnType: 'credit', source: 'transfer', note, transferGroupId },
  ];
}
