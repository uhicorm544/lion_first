'use client';

import { Suspense, useState } from 'react';
import TransactionSetup from '@/components/transactions/TransactionSetup';
import styles from './TradeButton.module.css';

interface TradeButtonProps {
  postId: string;
  buttonClassName: string;
}

export default function TradeButton({ postId, buttonClassName }: TradeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={buttonClassName} onClick={() => setOpen(true)}>
        거래하기
      </button>

      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} role="presentation">
          <div
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="거래 방식 선택"
          >
            <button type="button" className={styles.closeButton} onClick={() => setOpen(false)}>
              닫기
            </button>
            <Suspense fallback={<p className={styles.loading}>거래 정보를 불러오는 중...</p>}>
              <TransactionSetup postId={postId} />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}
