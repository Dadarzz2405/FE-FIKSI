import { useState, useEffect } from "react"

export function useCacheStatus() {
  const [cacheSize, setCacheSize] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    const calculateSize = () => {
      let size = 0
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith("fiksi_cache_")) {
          const item = localStorage.getItem(key)
          size += item ? item.length : 0
        }
      })
      setCacheSize(size)
    }

    calculateSize()
    
    // Recalculate periodically
    const interval = setInterval(calculateSize, 5000)
    return () => clearInterval(interval)
  }, [])

  return { cacheSize }
}
