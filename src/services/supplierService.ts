import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Supplier = Tables<"suppliers">;
export type SupplierInsert = TablesInsert<"suppliers">;

export const SupplierService = {
  async getSuppliers(projectId?: string): Promise<Supplier[]> {
    let query = supabase.from("suppliers").select("*").order("name");
    
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Supplier[];
  },

  async createSupplier(supplier: Omit<SupplierInsert, "id" | "created_at" | "updated_at">): Promise<Supplier> {
    const { data, error } = await supabase
      .from("suppliers")
      .insert(supplier)
      .select()
      .single();
    if (error) throw error;
    return data as Supplier;
  },

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from("suppliers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Supplier;
  },

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) throw error;
  }
};
