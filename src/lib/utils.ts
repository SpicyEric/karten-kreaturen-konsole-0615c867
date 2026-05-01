import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalisiert eine NFC UID auf das DB-Format: Hex-Paare getrennt durch ":",
 * Großbuchstaben. Akzeptiert Eingaben mit/ohne Doppelpunkten, Bindestrichen,
 * Leerzeichen.
 *  z.B. "04645400cc2a81" -> "04:64:54:00:CC:2A:81"
 *       "04:64:54:00:CC:2A:81" -> "04:64:54:00:CC:2A:81"
 */
export function normalizeNfcUid(raw: string): string {
  const hex = String(raw || "").replace(/[^0-9a-fA-F]/g, "").toUpperCase();
  return hex.match(/.{1,2}/g)?.join(":") ?? "";
}
