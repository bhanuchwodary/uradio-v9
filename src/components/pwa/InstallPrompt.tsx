
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { useIsMobile, useIsIOS } from '@/hooks/use-mobile';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  
  const isMobile = useIsMobile();
  const isIOS = useIsIOS();

  useEffect(() => {
    console.log('InstallPrompt: Component mounted, checking PWA status...', {
      isMobile,
      isIOS,
      userAgent: navigator.userAgent
    });
    
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isInWebAppiOS;
      
      console.log('InstallPrompt: PWA installation check:', {
        isStandalone,
        isInWebAppiOS,
        isInstalled,
        isMobile,
        isIOS
      });
      
      setIsInstalled(isInstalled);
      return isInstalled;
    };

    const installed = checkIfInstalled();
    
    if (installed) {
      console.log('InstallPrompt: App is already installed');
      return;
    }

    // Handle iOS devices separately (no beforeinstallprompt event)
    if (isIOS && isMobile) {
      console.log('InstallPrompt: iOS device detected, showing manual install option');
      const dismissed = sessionStorage.getItem('installPromptDismissed-ios');
      if (!dismissed) {
        setShowInstallPrompt(true);
      }
      return;
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('InstallPrompt: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const dismissed = sessionStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setShowInstallPrompt(true);
        console.log('InstallPrompt: Showing install prompt');
      } else {
        console.log('InstallPrompt: Prompt was dismissed in this session');
      }
    };

    // Listen for custom PWA installable event
    const handlePWAInstallable = () => {
      console.log('InstallPrompt: Custom PWA installable event received');
      const dismissed = sessionStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setShowInstallPrompt(true);
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('InstallPrompt: App was installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      sessionStorage.removeItem('installPromptDismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-installable', handlePWAInstallable);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For mobile devices without beforeinstallprompt, show after a delay
    if (isMobile && !isIOS) {
      const timer = setTimeout(() => {
        const dismissed = sessionStorage.getItem('installPromptDismissed-mobile');
        if (!dismissed && !deferredPrompt) {
          console.log('InstallPrompt: Mobile fallback - showing install option');
          setShowInstallPrompt(true);
        }
      }, 3000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('pwa-installable', handlePWAInstallable);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-installable', handlePWAInstallable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMobile, isIOS]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      console.log('InstallPrompt: No deferred prompt available, showing instructions');
      setShowIOSInstructions(true);
      return;
    }

    try {
      console.log('InstallPrompt: Triggering install prompt...');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('InstallPrompt: User choice:', outcome);
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      
      if (outcome === 'dismissed') {
        sessionStorage.setItem('installPromptDismissed', 'true');
      }
    } catch (error) {
      console.error('InstallPrompt: Error during install:', error);
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    console.log('InstallPrompt: User dismissed install prompt');
    setShowInstallPrompt(false);
    setShowIOSInstructions(false);
    
    if (isIOS) {
      sessionStorage.setItem('installPromptDismissed-ios', 'true');
    } else if (isMobile) {
      sessionStorage.setItem('installPromptDismissed-mobile', 'true');
    } else {
      sessionStorage.setItem('installPromptDismissed', 'true');
    }
  };

  // Don't show if already installed
  if (isInstalled || (!showInstallPrompt && !showIOSInstructions)) {
    return null;
  }

  // iOS Installation Instructions
  if (showIOSInstructions && isIOS) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 bg-card border border-border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Install Uradio on iOS
            </h3>
            <div className="text-sm text-muted-foreground mb-3 space-y-2">
              <p>To install this app on your iPhone/iPad:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Tap the <Share className="w-4 h-4 inline" /> Share button in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Got it
            </Button>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Standard Install Prompt
  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-card border border-border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Install Uradio
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {isMobile 
              ? "Install the app for a better mobile experience and offline access"
              : "Install the app for a better experience and offline access"
            }
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-1" />
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Not now
            </Button>
          </div>
        </div>
        <Button
          onClick={handleDismiss}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
