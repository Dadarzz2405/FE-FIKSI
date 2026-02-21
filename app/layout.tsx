"use client"

import "./globals.css"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import { usePathname } from "next/navigation"

// Auth routes that should NOT have Navbar/Sidebar
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"]

function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-100" style={{ marginLeft: "260px" }}>
          {children}
        </main>
      </div>
    </>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}