import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  GetApp as InstallIcon,
  Smartphone as PhoneIcon
} from '@mui/icons-material';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showInstallSnackbar, setShowInstallSnackbar] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after a delay if not already installed
      if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
        setTimeout(() => {
          setShowInstallDialog(true);
        }, 10000); // Show after 10 seconds
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallDialog(false);
      setShowInstallSnackbar(true);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallDialog(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallDialog(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const IOSInstallInstructions = () => (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <PhoneIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Install Perfumes Plug
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        To install this app on your iPhone:
      </Typography>
      <Box sx={{ textAlign: 'left', maxWidth: 300, mx: 'auto' }}>
        <Typography variant="body2" paragraph>
          1. Tap the Share button <strong>⎋</strong> at the bottom of the screen
        </Typography>
        <Typography variant="body2" paragraph>
          2. Scroll down and tap "Add to Home Screen"
        </Typography>
        <Typography variant="body2" paragraph>
          3. Tap "Add" to install the app
        </Typography>
      </Box>
    </Box>
  );

  if (isInstalled) {
    return (
      <Snackbar
        open={showInstallSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowInstallSnackbar(false)}
      >
        <Alert onClose={() => setShowInstallSnackbar(false)} severity="success">
          App installed successfully! You can now use Perfumes Plug offline.
        </Alert>
      </Snackbar>
    );
  }

  return (
    <>
      <Dialog
        open={showInstallDialog}
        onClose={handleDismiss}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InstallIcon color="primary" />
            <Typography variant="h6">Install Perfumes Plug</Typography>
          </Box>
          <IconButton onClick={handleDismiss} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {isIOS ? (
            <IOSInstallInstructions />
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <PhoneIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" paragraph>
                Install Perfumes Plug for a better mobile experience:
              </Typography>
              <Box sx={{ textAlign: 'left', maxWidth: 300, mx: 'auto' }}>
                <Typography variant="body2" paragraph>
                  ✓ Faster loading times
                </Typography>
                <Typography variant="body2" paragraph>
                  ✓ Offline browsing
                </Typography>
                <Typography variant="body2" paragraph>
                  ✓ Push notifications for orders
                </Typography>
                <Typography variant="body2" paragraph>
                  ✓ Home screen access
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleDismiss} color="inherit">
            Maybe Later
          </Button>
          {!isIOS && (
            <Button
              onClick={handleInstallClick}
              variant="contained"
              startIcon={<InstallIcon />}
              disabled={!deferredPrompt}
            >
              Install App
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showInstallSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowInstallSnackbar(false)}
      >
        <Alert onClose={() => setShowInstallSnackbar(false)} severity="success">
          App installed successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAInstallPrompt;