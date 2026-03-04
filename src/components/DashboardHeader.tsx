import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { NotificationBell } from "./NotificationBell";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  return (
    <header className="h-14 bg-background/95 backdrop-blur-[20px] border-b border-border px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="font-display font-[800] text-[20px] text-foreground">{title}</h2>
        {subtitle && (
          <>
            <span className="text-muted-foreground text-[10px]">•</span>
            <p className="text-[10px] text-muted-foreground tracking-wide">{subtitle}</p>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search projects, tasks..." 
            className="pl-9 h-8 text-[12px] bg-secondary border-border"
          />
        </div>
        
        <NotificationBell />
      </div>
    </header>
  );
};
