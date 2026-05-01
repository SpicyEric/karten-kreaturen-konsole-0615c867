import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Swords } from "lucide-react";

export default function AppKampf() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground flex flex-col items-center justify-center px-4 text-center space-y-6">
      <Swords size={64} className="text-primary" />
      <h1 className="font-mono text-3xl font-bold">Kampfsystem kommt bald</h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        Hier wird in Kürze das Training- und Kampfsystem für deine Kreaturen umgesetzt.
      </p>
      <Button onClick={() => navigate("/app")} size="lg" className="gap-2 min-h-[48px]">
        <ArrowLeft size={18} />
        Zurück zur Halle
      </Button>
    </div>
  );
}
