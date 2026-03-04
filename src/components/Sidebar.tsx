import { LayoutDashboard, FolderKanban, TrendingUp, DollarSign, AlertTriangle, Building2, FileText, Settings, LogOut, Shield } from "lucide-react";
import { NavLink } from "./NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { Button } from "./ui/button";

export const Sidebar = () => {
  const { profile, user, signOut } = useAuth();
  const { isAdmin } = useRoles();
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/projects", icon: FolderKanban, label: "Portfolio" },
    { to: "/meal", icon: TrendingUp, label: "MEAL" },
    { to: "/financial", icon: DollarSign, label: "Financial" },
    { to: "/risks", icon: AlertTriangle, label: "Risks" },
    { to: "/suppliers", icon: Building2, label: "Fornecedores" },
    { to: "/reports", icon: FileText, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const adminNavItems = [
    { to: "/admin", icon: Shield, label: "Administração" },
  ];

  return (
    <aside className="w-[220px] min-w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo block */}
      <div className="px-5 py-7 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-white font-display font-bold text-sm glow-accent"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            P
          </div>
          <div>
            <h1 className="font-display font-[800] text-[14px] text-sidebar-foreground leading-tight">PMO-EF</h1>
            <p className="text-[9px] tracking-[0.1em] text-muted-foreground uppercase mt-0.5">Earthworm Foundation</p>
          </div>
        </div>
      </div>
      
      {/* Nav section */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-[9px] tracking-[0.12em] text-muted-foreground uppercase px-3 mb-3">Navigation</p>
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className="flex items-center gap-[10px] px-3 py-[10px] rounded-lg text-muted-foreground transition-all duration-150 border-l-2 border-transparent text-[13px] font-mono hover:bg-sidebar-accent hover:text-sidebar-foreground"
                activeClassName="bg-primary/[0.18] text-sidebar-accent-foreground border-l-2 !border-primary font-medium"
              >
                <item.icon className="w-[14px] h-[14px]" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {isAdmin && (
          <>
            <div className="my-4">
              <p className="text-[9px] tracking-[0.12em] text-muted-foreground uppercase px-3 mb-3">Admin</p>
            </div>
            <ul className="space-y-0.5">
              {adminNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className="flex items-center gap-[10px] px-3 py-[10px] rounded-lg text-muted-foreground transition-all duration-150 border-l-2 border-transparent text-[13px] font-mono hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    activeClassName="bg-primary/[0.18] text-sidebar-accent-foreground border-l-2 !border-primary font-medium"
                  >
                    <item.icon className="w-[14px] h-[14px]" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* User block */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            {getInitials(profile?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-sidebar-foreground truncate">
              {profile?.full_name || user?.email?.split("@")[0]}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          onClick={signOut}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent text-[12px]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </Button>
      </div>
    </aside>
  );
};
