# NFC Kreaturen – Dev Tool

Physisch-digitales Kreaturensammelspiel mit NFC-Karten.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

## Capacitor – Native App Build

### Voraussetzungen
- Node.js 18+
- Für iOS: Mac mit Xcode 15+
- Für Android: Android Studio mit SDK 33+

### Setup

```bash
# 1. Projekt von GitHub klonen und Dependencies installieren
git clone <dein-repo>
cd nfc-kreaturen
npm install

# 2. Capacitor Dependencies installieren
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# 3. Plattformen hinzufügen
npx cap add ios
npx cap add android

# 4. Web-App bauen
npm run build

# 5. Sync
npx cap sync

# 6. Native App starten
npx cap run android   # oder: npx cap run ios
```

### Hot-Reload für Entwicklung

In `capacitor.config.ts` den `server`-Block einkommentieren und die Preview-URL einsetzen.

### NFC auf nativen Plattformen

**Android:** Web NFC API funktioniert in der WebView. Alternativ kann ein Capacitor NFC Plugin verwendet werden.

**iOS:** Web NFC wird NICHT unterstützt. Für iOS muss ein natives Capacitor NFC Plugin verwendet werden:
- [@niceplugins/capacitor-nfc](https://github.com/niceplugins/capacitor-nfc)
- Erfordert ein Apple Developer Account mit NFC-Entitlement

### Datenbank

Die App verwendet Lovable Cloud als Backend (PostgreSQL). Alle Tabellen:
- `creatures` – Kreatur-Blueprints
- `skills` – Globaler Skill-Pool
- `creature_skills` – Kreatur ↔ Skill Zuweisungen
- `nfc_cards` – Registrierte NFC-Karten
- `card_instances` – Lebende Kreatur-Instanzen auf Karten
