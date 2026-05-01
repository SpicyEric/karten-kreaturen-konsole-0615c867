import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/app/AppLayout";
import bgMenu from "@/assets/bg-menu.png";
import { Microscope, Dumbbell, User } from "lucide-react";

export default function AppMenu() {
  const navigate = useNavigate();
  return (
    <AppLayout bgImage={bgMenu} overlay={0.45}>
      <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-8 max-w-md mx-auto w-full">
        <header className="text-center space-y-1">
          <h1 className="font-mono text-3xl font-extrabold tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            NFC KREATUREN
          </h1>
          <p className="text-xs font-mono text-white/80 drop-shadow">Wähle dein Modul</p>
        </header>

        <div className="flex-1 w-full flex flex-col justify-center gap-5">
          <MenuButton
            icon={<Microscope size={32} />}
            title="Analysemodul"
            subtitle="Karte scannen & Kreatur untersuchen"
            onClick={() => navigate("/app/analyse")}
            color="from-cyan-500/80 to-blue-700/80 border-cyan-300/60"
          />
          <MenuButton
            icon={<Dumbbell size={32} />}
            title="Trainingshalle"
            subtitle="Bis zu 3 Kreaturen spawnen & trainieren"
            onClick={() => navigate("/app/training")}
            color="from-amber-500/80 to-rose-700/80 border-amber-300/60"
          />
          <MenuButton
            icon={<User size={28} />}
            title="Profil"
            subtitle="Statistiken & Einstellungen"
            onClick={() => navigate("/app/profil")}
            color="from-slate-500/70 to-slate-800/80 border-slate-300/40"
          />
        </div>

        <p className="text-[10px] font-mono text-white/60 mt-4">v0.2.0</p>
      </div>
    </AppLayout>
  );
}

function MenuButton({
  icon,
  title,
  subtitle,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border-2 bg-gradient-to-br ${color} backdrop-blur-md p-5 flex items-center gap-4 text-left shadow-[0_8px_30px_-8px_rgba(0,0,0,0.7)] hover:scale-[1.02] active:scale-[0.98] transition`}
    >
      <div className="w-14 h-14 rounded-xl bg-black/30 flex items-center justify-center text-white shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-lg font-bold text-white drop-shadow">{title}</div>
        <div className="text-[11px] font-mono text-white/85">{subtitle}</div>
      </div>
    </button>
  );
}
