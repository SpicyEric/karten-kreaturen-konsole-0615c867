import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nfckreaturen.app',
  appName: 'NFC Kreaturen',
  webDir: 'dist',
  server: {
    url: 'https://478c7da6-b7f8-4d05-8353-315b9be33bd3.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
