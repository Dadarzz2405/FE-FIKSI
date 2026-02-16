"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import "./Sidebar.css"

interface SidebarItem {
  name: string
  href: string
  icon: string
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Posts", href: "/posts", icon: "📝" },
  { name: "Quizzes", href: "/quizzes", icon: "❓" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">FIKSI</h2>
        <p className="sidebar-subtitle">Dashboard</p>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-list">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`sidebar-link ${
                  pathname === item.href ? "active" : ""
                }`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
