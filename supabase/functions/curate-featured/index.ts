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

    // Clear current featured
    await supabase
      .from("wallpapers")
      .update({ is_featured: false })
      .eq("is_featured", true);

    // Select new featured based on engagement score
    // Score = downloads_count * 2 + likes_count * 3
    const { data: topWallpapers, error } = await supabase
      .from("wallpapers")
      .select("id, downloads_count, likes_count")
      .eq("is_active", true)
      .order("downloads_count", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Sort by engagement score and pick top 12
    const scored = (topWallpapers || [])
      .map((wp) => ({
        id: wp.id,
        score: (wp.downloads_count || 0) * 2 + (wp.likes_count || 0) * 3,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    if (scored.length > 0) {
      const ids = scored.map((s) => s.id);
      await supabase
        .from("wallpapers")
        .update({ is_featured: true })
        .in("id", ids);
    }

    return new Response(
      JSON.stringify({
        success: true,
        featured_count: scored.length,
        featured_ids: scored.map((s) => s.id),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("curate-featured error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
