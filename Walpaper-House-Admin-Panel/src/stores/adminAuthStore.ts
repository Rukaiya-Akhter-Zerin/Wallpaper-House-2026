import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,
  error: null,

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check admin_users table
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from("admin_users")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        set({ isLoading: false, error: "Access denied. Admin privileges required." });
        return;
      }

      set({ user: data.user, session: data.session, isAdmin: true, isLoading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      set({ isLoading: false, error: message });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAdmin: false, isLoading: false, error: null });
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ isLoading: false });
        return;
      }

      const { data: adminData } = await supabaseAdmin
        .from("admin_users")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (adminData) {
        set({ user: session.user, session, isAdmin: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

// Auto-initialize on import
useAdminAuthStore.getState().initialize();
