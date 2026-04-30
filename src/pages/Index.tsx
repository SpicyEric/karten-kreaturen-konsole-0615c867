import { Link } from "react-router-dom";
import { Sword, Nfc } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm w-full">
        <h1 className="font-mono text-3xl font-bold text-primary">NFC Kreaturen</h1>
        <p className="text-muted-foreground text-sm">
          Dev-Tool für das physisch-digitale Kreaturensammelspiel
        </p>

        <div className="space-y-3">
          <Link to="/admin" className="block">
            <Button className="w-full gap-2" size="lg">
              <Sword size={18} />
              Admin Dashboard
            </Button>
          </Link>
          <Link to="/nfc-test" className="block">
            <Button variant="secondary" className="w-full gap-2" size="lg">
              <Nfc size={18} />
              NFC Test
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground font-mono">v0.1 · Dev Build</p>
      </div>
    </div>
  );
};

export default Index;
