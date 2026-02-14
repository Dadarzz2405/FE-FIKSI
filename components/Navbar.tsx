"use client"

import Link from "next/link"
import "./Navbar.css"

export default function Navbar() {
  return (
    <nav className="github-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-text">FIKSI</span>
        </div>
        
        <div className="navbar-links">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/login" className="nav-link">
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}