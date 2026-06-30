'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <button className={styles.iconBtn} aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          {!loading && (
            user ? (
              <div className={styles.avatarWrap} ref={dropdownRef}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-label="프로필 메뉴"
                >
                  <img
                    src={user.profileImageUrl || '/images/avatar-placeholder.svg'}
                    alt={user.nickname}
                  />
                </button>
                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    <span className={styles.dropdownName}>{user.nickname}</span>
                    <Link href="/mypage" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <span className="material-symbols-outlined">person</span>
                      마이페이지
                    </Link>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { setDropdownOpen(false); logout(); }}
                    >
                      <span className="material-symbols-outlined">logout</span>
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={styles.loginBtn}>
                로그인
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
