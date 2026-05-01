import AppLayout from "@/components/app/AppLayout";
import { User } from "lucide-react";

export default function AppProfil() {
  return (
    <AppLayout>
      <div className="px-4 pt-10 pb-4 max-w-md mx-auto text-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-full bg-card/60 border border-border/60 flex items-center justify-center">
          <User size={42} className="text-muted-foreground" />
        </div>
        <h1 className="font-mono text-2xl font-bold">Profil kommt bald</h1>
        <p className="text-xs text-muted-foreground font-mono">App Version 0.1.0</p>
      </div>
    </AppLayout>
  );
}
