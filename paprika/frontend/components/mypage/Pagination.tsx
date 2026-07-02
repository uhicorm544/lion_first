'use client';

/**
 * 공용 페이지네이션 컴포넌트
 * 담당: E - 장인호
 *
 * 사용법:
 *   <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
 */
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className={styles.pagination}>
      <button disabled={page === 0} onClick={() => onPageChange(page - 1)} className={styles.pageBtn}>
        이전
      </button>
      <span className={styles.pageInfo}>{page + 1} / {totalPages}</span>
      <button disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} className={styles.pageBtn}>
        다음
      </button>
    </div>
  );
}
