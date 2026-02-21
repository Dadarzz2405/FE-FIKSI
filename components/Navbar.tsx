"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import styles from "./Navbar.module.css"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/quizzes", label: "Quizzes" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  return (
    <header className={styles.navbar}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo}>
          FIKSI
        </Link>

        <nav className={styles.navLinks}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.authArea}>
          {loading ? (
            <div className={styles.avatarSkeleton} />
          ) : user ? (
            <div className={styles.userMenu} ref={menuRef}>
              <button
                type="button"
                className={styles.avatarButton}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.username}
                    className={styles.avatar}
                    width={32}
                    height={32}
                  />
                ) : (
                  <span className={styles.avatarFallback}>
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {menuOpen && (
                <div className={styles.dropdown} role="menu">
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownUsername}>@{user.username}</span>
                    {user.real_name && (
                      <span className={styles.dropdownRealName}>{user.real_name}</span>
                    )}
                  </div>
                  <div className={styles.dropdownDivider} />
                  <Link href={`/profile/${user.username}`} className={styles.dropdownItem} role="menuitem">
                    Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className={styles.authButton}>
              Login / Sign up
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}