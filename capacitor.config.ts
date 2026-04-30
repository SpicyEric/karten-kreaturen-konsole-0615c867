import type { CapacitorConfig } from '@niceplugins/capacitor-nfc';

// NOTE: Dieses Config-File wird erst aktiv, wenn Capacitor installiert wird.
// Die Capacitor-Abhängigkeiten werden NICHT im Web-Projekt installiert,
// sondern erst beim nativen Build-Prozess.

const config: CapacitorConfig = {
  appId: 'com.nfckreaturen.app',
  appName: 'NFC Kreaturen',
  webDir: 'dist',
  server: {
    // Für Entwicklung: Lovable Preview URL einsetzen
    // url: 'https://478c7da6-b7f8-4d05-8353-315b9be33bd3.lovableproject.com?forceHideBadge=true',
    // cleartext: true,
  },
};

export default config;
