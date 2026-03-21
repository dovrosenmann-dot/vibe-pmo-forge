import { supabase } from "@/integrations/supabase/client";

export const ProjectService = {
  async getProjectsBasics() {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, code")
      .order("name");
    if (error) throw error;
    return data;
  }
};
