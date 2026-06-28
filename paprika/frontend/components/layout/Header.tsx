/**
 * 공통 헤더
 * 담당: A - 민동현 (로그인 상태), B - 백성민 (검색창)
 *
 * TODO:
 *  - 로고
 *  - 검색창 (B - 백성민)
 *  - 로그인/프로필 버튼 (A - 민동현)
 *  - 알림 배지 (C - 한대천)
 */
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo} aria-label="Paprika Home">
            Paprika
          </Link>

          <div className={styles.searchWrapper}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input
              className={styles.search}
              placeholder="Search for items..."
              aria-label="Search"
            />
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="/products">Categories</Link>
          <Link href="/chat">Chat</Link>
          <Link href="/mypage">My Page</Link>
          <Link href="/transactions/status">Transactions</Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/products/new" className={styles.sellBtn}>
            Sell
          </Link>

          <button className={styles.iconBtn} aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <div className={styles.avatar}>
            <img src="/images/avatar-placeholder.svg" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
}
