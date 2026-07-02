'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import styles from './layout.module.css';

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // TODO: A(민동현)님이 /api/v1/auth/logout 구현 전까지는 기능 없음(요청만 하고 실패로 끝남).
  // 엔드포인트가 생기면 별도 수정 없이 바로 정상 동작함.
  const handleLogout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
      clearTokens();
      router.push('/login');
    } catch {
      // API 미구현 - 지금은 아무 동작 안 함
    }
  };

  return (
    <div className={styles.container}>

      {/* 사이드바 */}
      <aside className={styles.sidebar}>
        <Link href="/mypage" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2 className={styles.sidebarTitle}>마이페이지</h2>
        </Link>
        <button onClick={handleLogout} className={styles.logoutBtn}>로그아웃</button>

        <hr className={styles.divider} />

        <div className={styles.section}>
          <p className={styles.sectionTitle}>거래 정보</p>
          <ul className={styles.navList}>
            <li><Link href="/mypage/buy" className={styles.navLink}>구매내역</Link></li>
            <li><Link href="/mypage/buying" className={styles.navLink}>구매중</Link></li>
            <li><Link href="/mypage/sell" className={styles.navLink}>판매내역</Link></li>
            <li><Link href="/mypage/selling" className={styles.navLink}>판매중</Link></li>
            <li><Link href="/mypage/canceled" className={styles.navLink}>취소내역</Link></li>
          </ul>
        </div>

        <hr className={styles.divider} />

        <div>
          <p className={styles.sectionTitle}>내 정보</p>
          <ul className={styles.navList}>
            <li><Link href="/mypage/profile" className={styles.navLink}>회원정보 수정</Link></li>
            <li><Link href="/mypage/reviews" className={styles.navLink}>거래 후기</Link></li>
            <li><Link href="/mypage/wishlist" className={styles.navLink}>관심 상품</Link></li>
          </ul>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className={styles.main}>
        {children}
      </div>

    </div>
  );
}