'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type PaymentMethod = 'CASH' | 'CARD';
type TransactionType = 'DIRECT' | 'DELIVERY';

export default function TransactionPage() {
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');

  const router = useRouter();

  // 결제수단(현금/카드)은 택배거래(DELIVERY)에서만 선택 가능. 직거래(DIRECT)면 잠금.
  const isDirect = transactionType === 'DIRECT';

  const selectDirect = () => {
    setTransactionType('DIRECT');
    setPayment(null); // 직거래는 결제수단 불필요 → 선택값 초기화
  };

  const handleComplete = () => {
    // 직거래는 약속(장소/시간) 페이지로 이동, 그 외는 완료 알림
    if (isDirect) {
      router.push('/transactions/direct');
      return;
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.buttonRow}>
          <button
            type="button"
            className={payment === 'CASH' ? styles.optionActive : styles.optionButton}
            disabled={isDirect}
            onClick={() => setPayment('CASH')}
          >
            현금결제
          </button>
          <button
            type="button"
            className={payment === 'CARD' ? styles.optionActive : styles.optionButton}
            disabled={isDirect}
            onClick={() => setPayment('CARD')}
          >
            카드결제
          </button>
        </div>

        {payment === 'CASH' && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">
              휴대폰 번호
            </label>
            <input
              id="phone"
              className={styles.input}
              type="tel"
              placeholder="휴대폰 번호 입력 (예: 010-1234-5678)"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
            />

            <label className={styles.label} htmlFor="business">
              사업자번호
            </label>
            <input
              id="business"
              className={styles.input}
              type="text"
              placeholder="사업자번호 입력 (예: 123-45-67890)"
              value={businessNumber}
              onChange={(event) => setBusinessNumber(event.target.value)}
            />
          </div>
        )}

        <div className={styles.buttonRow}>
          <button
            type="button"
            className={transactionType === 'DIRECT' ? styles.optionActive : styles.optionButton}
            onClick={selectDirect}
          >
            직거래
          </button>
          <button
            type="button"
            className={transactionType === 'DELIVERY' ? styles.optionActive : styles.optionButton}
            onClick={() => setTransactionType('DELIVERY')}
          >
            택배거래
          </button>
        </div>

        <button
          type="button"
          className={styles.completeButton}
          onClick={handleComplete}
        >
          완료
        </button>
      </div>
    </main>
  );
}
