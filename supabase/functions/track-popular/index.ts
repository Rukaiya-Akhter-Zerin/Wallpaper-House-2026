// @ts-ignore
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { wallpaper_id, user_id, platform, resolution, action } = await req.json();

    if (!wallpaper_id || !action) {
      return new Response(
        JSON.stringify({ error: "wallpaper_id and action are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Track download
    if (action === "download") {
      await supabase.from("downloads_log").insert({
        wallpaper_id,
        user_id: user_id || null,
        platform: platform || "unknown",
        resolution: resolution || null,
      });

      // Increment download count
      await supabase.rpc("increment_column", {
        table_name: "wallpapers",
        column_name: "downloads_count",
        row_id: wallpaper_id,
      }).then(async () => {
        // Fallback: direct update if RPC doesn't exist
        const { data: wp } = await supabase
          .from("wallpapers")
          .select("downloads_count")
          .eq("id", wallpaper_id)
          .single();
        if (wp) {
          await supabase
            .from("wallpapers")
            .update({ downloads_count: (wp.downloads_count || 0) + 1 })
            .eq("id", wallpaper_id);
        }
      });
    }

    // Track view
    if (action === "view" && user_id) {
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("usage_stats")
        .select("wallpapers_viewed")
        .eq("user_id", user_id)
        .eq("date", today)
        .single();

      if (existing) {
        await supabase
          .from("usage_stats")
          .update({ wallpapers_viewed: (existing.wallpapers_viewed || 0) + 1 })
          .eq("user_id", user_id)
          .eq("date", today);
      } else {
        await supabase.from("usage_stats").insert({
          user_id,
          date: today,
          wallpapers_viewed: 1,
        });
      }
    }

    // Get trending wallpapers
    if (action === "trending") {
      const { data: trending } = await supabase
        .from("wallpapers")
        .select("id, title, downloads_count, likes_count, thumbnail_url_small")
        .eq("is_active", true)
        .order("downloads_count", { ascending: false })
        .limit(20);

      return new Response(
        JSON.stringify({ success: true, trending }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("track-popular error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
