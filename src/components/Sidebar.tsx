import { LayoutDashboard, FolderKanban, TrendingUp, DollarSign, AlertTriangle, Building2, FileText, Settings, LogOut, Shield, FileSearch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "./NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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

  const { t } = useTranslation();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: t("sidebar.dashboard") },
    { to: "/projects", icon: FolderKanban, label: t("sidebar.projects") },
    { to: "/meal", icon: TrendingUp, label: "MEAL" },
    { to: "/financial", icon: DollarSign, label: t("sidebar.finance") },
    { to: "/risks", icon: AlertTriangle, label: "Risks" },
    { to: "/suppliers", icon: Building2, label: t("sidebar.suppliers") },
    { to: "/reports", icon: FileText, label: "Reports" },
    { to: "/settings", icon: Settings, label: t("sidebar.settings") },
  ];

  const adminNavItems = [
    { to: "/admin", icon: Shield, label: t("sidebar.admin") },
    { to: "/audit", icon: FileSearch, label: "Auditoria" },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">PMO-EF</h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Earthworm Foundation</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {isAdmin && (
          <>
            <div className="my-4 border-t border-sidebar-border" />
            <ul className="space-y-1">
              {adminNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || user?.email?.split("@")[0]}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          onClick={signOut}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4" />
          {t("sidebar.logout")}
        </Button>
      </div>
    </aside>
  );
};
