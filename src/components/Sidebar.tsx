import { LayoutDashboard, FolderKanban, TrendingUp, DollarSign, AlertTriangle, Users, FileText, Settings } from "lucide-react";
import { NavLink } from "./NavLink";

export const Sidebar = () => {
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/projects", icon: FolderKanban, label: "Portfolio" },
    { to: "/meal", icon: TrendingUp, label: "MEAL" },
    { to: "/financial", icon: DollarSign, label: "Financial" },
    { to: "/risks", icon: AlertTriangle, label: "Risks" },
    { to: "/suppliers", icon: Users, label: "Suppliers" },
    { to: "/reports", icon: FileText, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" },
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
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-accent-foreground">PM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">PMO Manager</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">pmo@earthworm.org</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
