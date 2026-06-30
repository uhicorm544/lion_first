import TransactionStatus from '@/components/transactions/TransactionStatus';

// 재사용 모듈(TransactionStatus)을 띄우는 테스트 페이지 (URL: /transactions/status/test)
export default function TransactionStatusTestPage() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
      <TransactionStatus title="내 거래" />
    </main>
  );
}
