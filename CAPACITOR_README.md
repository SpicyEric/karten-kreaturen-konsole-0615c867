# NFC Kreaturen – Dev Tool & Spieler App

Physisch-digitales Kreaturensammelspiel mit NFC-Karten.

## Routen

- `/` – Landing (Auswahl)
- `/admin` – Admin Tool (Kreaturen, Skills, Karten registrieren)
- `/app` – Spieler App (mobile-first, Capacitor-ready)
- `/nfc-test` – NFC UID Test

## Lokale Web-Entwicklung

```bash
npm install
npm run dev
```

## Native App auf Android (Capacitor)

### Voraussetzungen
- Node.js 18+
- Android Studio + Android SDK 33+
- Physisches Android-Gerät mit NFC (oder Emulator – NFC dann nur via Code-Injection)

### Erst-Setup nach GitHub-Clone

```bash
# 1. Repo klonen (über "Export to GitHub" in Lovable)
git clone <dein-repo>
cd <dein-repo>
npm install

# 2. Native Android-Plattform hinzufügen
npx cap add android

# 3. Build + Sync
npm run build
npx cap sync android

# 4. In Android Studio öffnen
npx cap open android
```

### NFC-Permissions (Android)

Nach `npx cap add android` einmalig in
`android/app/src/main/AndroidManifest.xml` im `<manifest>`-Block einfügen:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="true" />
```

Dann erneut `npx cap sync android` ausführen.

### Hot-Reload (Live vom Lovable-Sandbox)

`capacitor.config.ts` zeigt bereits auf die Lovable Preview-URL.
Solange die App im `server.url` geladen wird, siehst du Code-Änderungen live
auf dem Gerät, sobald in Lovable gespeichert wird.

Für eine Offline/Production-Build den `server`-Block entfernen, dann:
```bash
npm run build && npx cap sync android
```

### Nach jedem `git pull`

```bash
npm install
npm run build
npx cap sync android
```

## Datenbank (Lovable Cloud / Supabase)

Tabellen: `creatures`, `skills`, `skill_folders`, `creature_skills`,
`nfc_cards`, `card_instances`.
Sprites werden im Storage-Bucket `sprites` abgelegt.
