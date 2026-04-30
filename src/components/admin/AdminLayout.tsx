import { Link, useLocation } from "react-router-dom";
import { Sword, Zap, CreditCard, List } from "lucide-react";

const NAV_ITEMS = [
  { path: "/admin", label: "Kreaturen", icon: Sword },
  { path: "/admin/skills", label: "Skills", icon: Zap },
  { path: "/admin/cards", label: "NFC Karten", icon: CreditCard },
  { path: "/admin/list", label: "Übersicht", icon: List },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="font-mono text-lg font-bold text-primary">
          NFC Kreaturen <span className="text-muted-foreground text-sm font-normal">Admin</span>
        </Link>
        <Link to="/nfc-test" className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono">
          NFC Test →
        </Link>
      </header>

      <nav className="border-b border-border px-2 flex gap-1 overflow-x-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 p-4 max-w-4xl w-full mx-auto">{children}</main>
    </div>
  );
}
