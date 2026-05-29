// @ts-ignore
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UsageRecord {
  user_id: string;
  date: string;
  wallpapers_viewed: number;
  wallpapers_set: number;
  wallpapers_downloaded: number;
  session_seconds: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { records }: { records: UsageRecord[] } = await req.json();

    if (!records || !Array.isArray(records)) {
      return new Response(
        JSON.stringify({ error: "Invalid request body. Expected { records: UsageRecord[] }" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];
    for (const record of records) {
      const { data, error } = await supabase
        .from("usage_stats")
        .upsert(
          {
            user_id: record.user_id,
            date: record.date,
            wallpapers_viewed: record.wallpapers_viewed,
            wallpapers_set: record.wallpapers_set,
            wallpapers_downloaded: record.wallpapers_downloaded,
            session_seconds: record.session_seconds,
          },
          { onConflict: "user_id,date" }
        );

      if (error) {
        console.error(`Error upserting record for user ${record.user_id}:`, error);
        results.push({ user_id: record.user_id, success: false, error: error.message });
      } else {
        results.push({ user_id: record.user_id, success: true });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sync-analytics error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
