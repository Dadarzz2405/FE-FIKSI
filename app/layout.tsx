import "./globals.css"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        
        <Navbar />

        <div className="flex flex-1">
          <Sidebar />
          
          <main className="flex-1 p-6 bg-gray-100">
            {children}
          </main>
        </div>

      </body>
    </html>
  )
}
