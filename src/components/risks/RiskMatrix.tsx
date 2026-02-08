import { ProjectRisk, RiskProbability, RiskImpact } from "@/hooks/useProjectRisks";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskMatrixProps {
  risks: ProjectRisk[];
}

const probLabels: { key: RiskProbability; label: string }[] = [
  { key: "high", label: "Alta" },
  { key: "medium", label: "Média" },
  { key: "low", label: "Baixa" },
];

const impactLabels: { key: RiskImpact; label: string }[] = [
  { key: "low", label: "Baixo" },
  { key: "medium", label: "Médio" },
  { key: "high", label: "Alto" },
];

function getCellColor(prob: RiskProbability, impact: RiskImpact): string {
  const score = { low: 1, medium: 2, high: 3 };
  const val = score[prob] * score[impact];
  if (val >= 6) return "bg-destructive/20 border-destructive/40";
  if (val >= 3) return "bg-warning/20 border-warning/40";
  return "bg-success/20 border-success/40";
}

export const RiskMatrix = ({ risks }: RiskMatrixProps) => {
  const activeRisks = risks.filter(r => r.status !== "resolved");

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Matriz de Risco (Probabilidade × Impacto)
      </h3>
      <div className="flex">
        {/* Y-axis label */}
        <div className="flex flex-col justify-center mr-2">
          <span className="text-xs text-muted-foreground -rotate-90 whitespace-nowrap">
            Probabilidade
          </span>
        </div>

        <div className="flex-1">
          {/* Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {probLabels.map((prob) =>
              impactLabels.map((impact) => {
                const cellRisks = activeRisks.filter(
                  (r) => r.probability === prob.key && r.impact === impact.key
                );
                return (
                  <div
                    key={`${prob.key}-${impact.key}`}
                    className={`relative border rounded-lg p-3 min-h-[80px] flex flex-col items-center justify-center transition-all ${getCellColor(prob.key, impact.key)}`}
                  >
                    {cellRisks.length > 0 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground/10 text-foreground font-bold text-sm cursor-default">
                            {cellRisks.length}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[250px]">
                          <ul className="text-xs space-y-1">
                            {cellRisks.map((r) => (
                              <li key={r.id}>• {r.title}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* X-axis labels */}
          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
            {impactLabels.map((impact) => (
              <div key={impact.key} className="text-center text-xs text-muted-foreground">
                {impact.label}
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-muted-foreground mt-1">Impacto</div>
        </div>

        {/* Y-axis labels */}
        <div className="flex flex-col justify-between ml-2 py-0">
          {probLabels.map((prob) => (
            <div key={prob.key} className="text-xs text-muted-foreground flex items-center min-h-[80px]">
              {prob.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
