import { Suspense } from 'react';
import TransactionSetup from '@/components/transactions/TransactionSetup';
import styles from './page.module.css';

// 거래 방식 선택 라우트 (URL: /transactions?postId=)
export default function TransactionPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<p className={styles.loading}>거래 정보를 불러오는 중...</p>}>
        <TransactionSetup />
      </Suspense>
    </main>
  );
}
