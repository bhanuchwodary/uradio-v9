
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Enhanced iOS detection hook for PWA
export function useIsIOS() {
  const [isIOS, setIsIOS] = React.useState<boolean>(false)

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    
    console.log('useIsIOS: Detection result:', {
      userAgent,
      isIOSDevice,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints
    });
    
    setIsIOS(isIOSDevice)
  }, [])

  return isIOS
}

// Device orientation hook for iOS PWA
export function useDeviceOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait')

  React.useEffect(() => {
    const updateOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        setOrientation('portrait')
      } else {
        setOrientation('landscape')
      }
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}

// PWA detection hook
export function useIsPWA() {
  const [isPWA, setIsPWA] = React.useState<boolean>(false)

  React.useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    const isPWAMode = isStandalone || isInWebAppiOS
    
    console.log('useIsPWA: PWA detection:', {
      isStandalone,
      isInWebAppiOS,
      isPWAMode
    });
    
    setIsPWA(isPWAMode)
  }, [])

  return isPWA
}

// Mobile browser detection for PWA compatibility
export function useMobileBrowser() {
  const [browserInfo, setBrowserInfo] = React.useState({
    isChrome: false,
    isSafari: false,
    isFirefox: false,
    supportsPWA: false
  })

  React.useEffect(() => {
    const userAgent = navigator.userAgent
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)
    const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor)
    const isFirefox = /Firefox/.test(userAgent)
    
    // PWA support detection
    const supportsPWA = 'serviceWorker' in navigator && 
                       ('PushManager' in window || isChrome || isSafari)

    console.log('useMobileBrowser: Browser detection:', {
      userAgent,
      isChrome,
      isSafari,
      isFirefox,
      supportsPWA
    });

    setBrowserInfo({
      isChrome,
      isSafari,
      isFirefox,
      supportsPWA
    })
  }, [])

  return browserInfo
}
