"use client"

import { useEffect, useState } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768) // 768px is a common breakpoint for tablets
    }

    // Initial check
    checkDevice()

    // Listen for window resize
    window.addEventListener("resize", checkDevice)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return isMobile
}
