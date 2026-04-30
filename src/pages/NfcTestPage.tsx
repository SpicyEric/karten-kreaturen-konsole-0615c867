import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import TypeBadge from "@/components/admin/TypeBadge";
import RarityBadge from "@/components/admin/RarityBadge";
import { FORM_LABELS } from "@/lib/constants";
import { Nfc, ArrowLeft } from "lucide-react";

interface CreatureData {
  name: string;
  description: string | null;
  type: string;
  rarity: string;
  form: string;
  base_strength: number;
  base_speed: number;
  base_magic: number;
  max_active_skills: number;
  image_url: string | null;
  card_instance?: {
    skill_points: number;
    battles_fought: number;
    training_sessions: number;
    unlocked_skills: string[] | null;
    active_skills: string[] | null;
  };
}

export default function NfcTestPage() {
  const [status, setStatus] = useState<"idle" | "scanning" | "found" | "not_found" | "error" | "unsupported">("idle");
  const [scannedUid, setScannedUid] = useState("");
  const [manualUid, setManualUid] = useState("");
  const [creature, setCreature] = useState<CreatureData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const lookupCard = async (uid: string) => {
    const normalizedUid = uid.trim().toUpperCase();
    setScannedUid(normalizedUid);
    setStatus("scanning");

    try {
      const { data: card, error } = await supabase
        .from("nfc_cards")
        .select("*, creatures(*), card_instances(*)")
        .eq("uid", normalizedUid)
        .maybeSingle();

      if (error) throw error;

      if (!card || !card.creatures) {
        setStatus("not_found");
        setCreature(null);
        return;
      }

      const instance = Array.isArray(card.card_instances) ? card.card_instances[0] : card.card_instances;

      setCreature({
        ...card.creatures,
        card_instance: instance || undefined,
      });
      setStatus("found");

      if (!card.first_scanned_at) {
        await supabase.from("nfc_cards").update({ first_scanned_at: new Date().toISOString() }).eq("id", card.id);
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message);
    }
  };

  const startNfcScan = async () => {
    if (!("NDEFReader" in window)) {
      setStatus("unsupported");
      setErrorMsg(
        "Web NFC wird auf diesem Gerät/Browser nicht unterstützt. " +
        "Nutze Chrome auf einem Android-Gerät oder gib die UID manuell ein."
      );
      return;
    }

    setStatus("scanning");
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", ({ serialNumber }: any) => {
        const uid = serialNumber.replace(/:/g, ":").toUpperCase();
        lookupCard(uid);
      });

      ndef.addEventListener("readingerror", () => {
        setStatus("error");
        setErrorMsg("Fehler beim Lesen der NFC-Karte.");
      });
    } catch (e: any) {
      setStatus("error");
      setErrorMsg("NFC Scan fehlgeschlagen: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-mono text-xl font-bold text-primary">NFC Test</h1>
        <div className="w-5" />
      </div>

      <div className="space-y-4">
        <Button
          onClick={startNfcScan}
          className="w-full h-32 text-lg gap-3 animate-pulse-glow"
          disabled={status === "scanning"}
        >
          <Nfc size={32} />
          {status === "scanning" ? "Scanne..." : "Karte scannen"}
        </Button>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Oder UID manuell eingeben:</Label>
          <div className="flex gap-2">
            <Input
              value={manualUid}
              onChange={(e) => setManualUid(e.target.value)}
              placeholder="04:A3:B2:C1:D4:E5:F6"
              className="font-mono"
            />
            <Button variant="secondary" onClick={() => lookupCard(manualUid)} disabled={!manualUid.trim()}>
              Suchen
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {status === "scanning" && (
          <div className="text-center py-8">
            <div className="animate-pulse text-primary font-mono text-sm">Halte eine NFC-Karte an dein Gerät...</div>
          </div>
        )}

        {status === "unsupported" && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive">
            {errorMsg}
          </div>
        )}

        {status === "error" && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive">
            {errorMsg}
          </div>
        )}

        {status === "not_found" && (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="font-mono text-sm text-muted-foreground mb-2">UID: {scannedUid}</p>
            <p className="text-foreground font-medium">Karte nicht registriert</p>
            <p className="text-xs text-muted-foreground mt-1">
              Registriere diese Karte im Admin-Bereich unter "NFC Karten".
            </p>
          </div>
        )}

        {status === "found" && creature && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <p className="font-mono text-xs text-muted-foreground">UID: {scannedUid}</p>

            <div>
              <h2 className="font-mono text-2xl font-bold">{creature.name}</h2>
              {creature.description && <p className="text-sm text-muted-foreground">{creature.description}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              <TypeBadge type={creature.type} />
              <RarityBadge rarity={creature.rarity} />
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                {FORM_LABELS[creature.form]}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "STR", value: creature.base_strength },
                { label: "SPD", value: creature.base_speed },
                { label: "MAG", value: creature.base_magic },
              ].map(({ label, value }) => (
                <div key={label} className="bg-secondary rounded p-2">
                  <div className="text-xs text-muted-foreground font-mono">{label}</div>
                  <div className="text-lg font-bold font-mono text-primary">{value}</div>
                </div>
              ))}
            </div>

            {creature.card_instance && (
              <div className="border-t border-border pt-3 space-y-2">
                <h3 className="font-mono text-sm font-bold text-muted-foreground">Karten-Instanz</h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-muted rounded p-2">
                    <div className="text-muted-foreground">Skill-Punkte</div>
                    <div className="font-mono font-bold text-foreground">{creature.card_instance.skill_points}</div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <div className="text-muted-foreground">Kämpfe</div>
                    <div className="font-mono font-bold text-foreground">{creature.card_instance.battles_fought}</div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <div className="text-muted-foreground">Training</div>
                    <div className="font-mono font-bold text-foreground">{creature.card_instance.training_sessions}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 border border-dashed border-border rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground font-mono">
          📝 Schreib-Modus (zukünftig): Hier wird später die Möglichkeit eingebaut,
          Daten auf die NFC-Karte zu schreiben.
        </p>
      </div>
    </div>
  );
}
