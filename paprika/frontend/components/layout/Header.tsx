"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnread } from "@/contexts/UnreadContext";
import styles from "./Header.module.css";

export default function Header() {
	const { user, loading, logout } = useAuth();
	const { total } = useUnread();
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<header className={styles.header}>
			<div className={styles.container}>
				<div className={styles.left}>
					<Link href="/" className={styles.logo} aria-label="Paprika Home">
						Paprika
					</Link>

					<div className={styles.searchWrapper}>
						<span className={`material-symbols-outlined ${styles.searchIcon}`}>
							search
						</span>
						<input
							className={styles.search}
							placeholder="Search for items..."
							aria-label="Search"
						/>
					</div>
				</div>

				<nav className={styles.nav}>
					<Link href="/products">Categories</Link>
					<Link
							href="/chat"
							style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
						>
							Chat
							{total > 0 && (
								<span
									style={{
										minWidth: 20,
										height: 20,
										padding: "0 6px",
										display: "inline-flex",
										alignItems: "center",
										justifyContent: "center",
										borderRadius: 10,
										background: "var(--color-error, #e5484d)",
										color: "#fff",
										fontSize: 11,
										fontWeight: 700,
										lineHeight: 1,
									}}
								>
									{total > 99 ? "99+" : total}
								</span>
							)}
						</Link>
					<Link href="/mypage">My Page</Link>
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
                    <span className={styles.dropdownEmail}>{user.email}</span>
                    <Link href="/mypage" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <span className="material-symbols-outlined">person</span>
                      마이페이지
                    </Link>
                    <Link href="/products/new" className={styles.dropdownItem}	onClick={() => setDropdownOpen(false)}>
                      <span className="material-symbols-outlined">add</span>
                      상품 등록
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
