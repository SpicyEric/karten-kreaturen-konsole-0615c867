import { useCallback, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { normalizeNfcUid } from "@/lib/utils";

/**
 * NFC Scanner Hook – funktioniert sowohl auf nativem Android (Capacitor + @exxili/capacitor-nfc)
 * als auch im Browser (Web NFC API, Chrome Android).
 *
 * onUid wird mit der gelesenen UID (uppercase, ohne Doppelpunkte normalisiert) aufgerufen.
 */
export function useNfcScanner(onUid: (uid: string) => void) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  

  const unsubscribeRef = useRef<(() => void) | null>(null);

  const stop = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (unsubscribeRef.current) {
      try { unsubscribeRef.current(); } catch {}
      unsubscribeRef.current = null;
    }
    if (Capacitor.isNativePlatform()) {
      try {
        const mod: any = await import("@exxili/capacitor-nfc");
        await mod.NFC?.cancelScan?.();
      } catch {}
    }
    setScanning(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setScanning(true);

    // Native (Android via Capacitor)
    if (Capacitor.isNativePlatform()) {
      try {
        const mod: any = await import("@exxili/capacitor-nfc");
        const NFC = mod.NFC;
        if (!NFC || typeof NFC.onRead !== "function") {
          throw new Error("NFC Plugin nicht verfügbar");
        }

        // onRead returns an unsubscribe function (NOT a { remove } handle)
        const unsubscribe = NFC.onRead((data: any) => {
          let uid = "";
          try {
            const messages = typeof data?.string === "function" ? data.string() : data;
            uid = messages?.tagInfo?.uid || "";
          } catch {
            uid = data?.tagInfo?.uid || "";
          }
          uid = normalizeNfcUid(uid);
          if (uid) {
            onUid(uid);
            stop();
          }
        });
        unsubscribeRef.current = unsubscribe;

        // Optional error listener
        if (typeof NFC.onError === "function") {
          NFC.onError((err: any) => {
            setError("NFC Fehler: " + (err?.error ?? String(err)));
          });
        }

        // Android: kein startScan nötig – onRead lauscht automatisch.
        // iOS: startScan() ist erforderlich, um Session zu öffnen.
        if (Capacitor.getPlatform() === "ios" && typeof NFC.startScan === "function") {
          try { await NFC.startScan(); } catch {}
        }
        return;
      } catch (e: any) {
        setScanning(false);
        setError("NFC nicht verfügbar: " + (e?.message ?? String(e)));
        return;
      }
    }

    // Web NFC (Chrome Android)
    if (!("NDEFReader" in window)) {
      setScanning(false);
      setError("Web NFC wird auf diesem Gerät/Browser nicht unterstützt. Nutze Chrome auf Android oder die native App.");
      return;
    }
    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const ndef = new (window as any).NDEFReader();
      await ndef.scan({ signal: controller.signal });

      ndef.addEventListener(
        "reading",
        (event: any) => {
          if (typeof event.preventDefault === "function") event.preventDefault();
          const uid = normalizeNfcUid(event.serialNumber || "");
          if (!uid) return;
          onUid(uid);
          controller.abort();
          abortRef.current = null;
          setScanning(false);
        },
        { signal: controller.signal }
      );
      ndef.addEventListener(
        "readingerror",
        () => setError("Fehler beim Lesen – Karte erneut anhalten."),
        { signal: controller.signal }
      );
    } catch (e: any) {
      setScanning(false);
      if (e?.name !== "AbortError") setError("NFC Scan fehlgeschlagen: " + e.message);
    }
  }, [onUid, stop]);

  return { scanning, error, start, stop };
}
