import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import { ArrowLeft, User } from "lucide-react";

export default function AppProfil() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="relative z-10 flex items-center justify-between px-4 pt-4">
        <button
          onClick={() => navigate("/app")}
          className="p-2 rounded-lg bg-black/40 backdrop-blur text-white"
          aria-label="Zurück"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-mono text-lg font-bold text-white">Profil</h1>
        <div className="w-9" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-4">
        <div className="w-24 h-24 rounded-full bg-card/60 border border-border/60 flex items-center justify-center">
          <User size={42} className="text-muted-foreground" />
        </div>
        <h2 className="font-mono text-2xl font-bold">Profil kommt bald</h2>
        <p className="text-xs text-muted-foreground font-mono">App Version 0.2.0</p>
      </div>
    </AppLayout>
  );
}
