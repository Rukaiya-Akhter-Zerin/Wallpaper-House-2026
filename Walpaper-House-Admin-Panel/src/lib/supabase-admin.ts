import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn("Supabase admin credentials not found. Set VITE_SUPABASE_SERVICE_ROLE_KEY in .env");
}

export const supabaseAdmin = createClient<Database>(supabaseUrl ?? "", serviceRoleKey ?? "", {
  auth: { autoRefreshToken: false, persistSession: false },
});
