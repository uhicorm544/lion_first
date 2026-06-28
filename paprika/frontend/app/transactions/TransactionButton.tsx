'use client';

import { useRouter } from 'next/navigation';
import type { ProductStatus } from '@/types';
import styles from './page.module.css';

const DISABLED_LABEL: Partial<Record<ProductStatus, string>> = {
  RESERVED: '예약중',
  SOLD: '판매완료',
  DRAFT: '판매 준비중',
};

export default function TransactionButton({ status }: { status: ProductStatus }) {
  const router = useRouter();
  const disabled = status !== 'SELLING';

  return (
    <button
      className={styles.primaryButton}
      type="button"
      disabled={disabled}
      onClick={() => router.push('/transactions')}
    >
      {disabled ? DISABLED_LABEL[status] ?? '거래 불가' : '거래하기'}
    </button>
  );
}
