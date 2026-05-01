import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Dumbbell, User } from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isProfile = pathname.startsWith("/app/profil");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground flex flex-col">
      <main className="flex-1 pb-20 overflow-y-auto">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f17] border-t border-border/60 backdrop-blur-md z-40">
        <div className="grid grid-cols-2 max-w-md mx-auto">
          <NavLink
            to="/app"
            end
            className={() =>
              `flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] ${
                !isProfile ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Dumbbell size={22} />
            <span className="text-[11px] font-mono">Training</span>
          </NavLink>
          <NavLink
            to="/app/profil"
            className={() =>
              `flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] ${
                isProfile ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <User size={22} />
            <span className="text-[11px] font-mono">Profil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
