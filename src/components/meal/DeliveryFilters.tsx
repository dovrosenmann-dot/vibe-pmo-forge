import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DeliveryFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  projectId?: string;
}

export function DeliveryFilters({ filters, onFiltersChange, projectId }: DeliveryFiltersProps) {
  const { data: workstreams } = useQuery({
    queryKey: ["workstreams", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workstreams")
        .select("id, name")
        .eq("project_id", projectId || "");
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-48">
        <Label>Workstream</Label>
        <Select
          value={filters.workstreamId}
          onValueChange={(value) => onFiltersChange({ ...filters, workstreamId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {workstreams?.map((ws) => (
              <SelectItem key={ws.id} value={ws.id}>
                {ws.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <Label>Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Planned">Planned</SelectItem>
            <SelectItem value="In-Progress">In-Progress</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-40">
        <Label>Data De</Label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
        />
      </div>

      <div className="w-40">
        <Label>Data Até</Label>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
        />
      </div>
    </div>
  );
}
