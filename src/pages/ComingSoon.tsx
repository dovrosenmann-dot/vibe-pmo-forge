import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  subtitle: string;
  description: string;
}

const ComingSoon = ({ title, subtitle, description }: ComingSoonProps) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DashboardHeader title={title} subtitle={subtitle} />
      
      <main className="flex-1 overflow-auto p-[32px_36px] flex items-center justify-center animate-fade-in">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="font-display font-bold text-[16px] text-foreground mb-2">Coming Soon</h3>
            <p className="text-[12px] font-mono text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ComingSoon;
