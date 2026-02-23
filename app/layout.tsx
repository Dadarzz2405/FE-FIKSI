"use client"

import "./globals.css"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import { LanguageProvider } from "@/i18n/LanguageContext"
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
      <div className="appShell">
        <Sidebar />
        <main className="appMain">
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
    <html lang="id">
      <body className="appBody">
        <LanguageProvider>
          <LayoutShell>{children}</LayoutShell>
        </LanguageProvider>
      </body>
    </html>
  )
}
