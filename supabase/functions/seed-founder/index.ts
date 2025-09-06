// Seed a founder user and grant founder access
// This function uses the service role to create a user if needed and update their profile.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json"
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, founder } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "email and password are required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Try to create the user (email_confirm=true to bypass confirmation for seeding)
    let userId: string | null = null;
    const createRes = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { seeded: true, role: "founder" },
    });

    if (createRes.error) {
      // If user already exists, find them by email
      // Note: getUserByEmail is not exposed; list and filter for dev seeding is fine
      const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (list.error) {
        return new Response(JSON.stringify({ error: list.error.message }), { status: 500, headers: corsHeaders });
      }
      const found = list.data.users.find((u: any) => u.email?.toLowerCase() === String(email).toLowerCase());
      if (!found) {
        return new Response(JSON.stringify({ error: "User exists but could not be retrieved" }), { status: 500, headers: corsHeaders });
      }
      userId = found.id;
    } else {
      userId = createRes.data.user?.id ?? null;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unable to determine user id" }), { status: 500, headers: corsHeaders });
    }

    // Ensure profile exists and mark as founder
    // First attempt an update; if missing, upsert with id
    const profileUpdates: Record<string, any> = {
      email,
      is_founder: founder === false ? false : true,
      role: "founder",
      plan: "pro",
      subscription_status: "active",
      subscription_plan: "pro",
      updated_at: new Date().toISOString(),
    };

    const { error: updateErr } = await admin
      .from("profiles")
      .update(profileUpdates)
      .eq("id", userId);

    if (updateErr) {
      // Try upsert if update failed (e.g., row doesn't exist yet)
      const { error: upsertErr } = await admin
        .from("profiles")
        .upsert({ id: userId, created_at: new Date().toISOString(), ...profileUpdates }, { onConflict: "id" });
      if (upsertErr) {
        return new Response(JSON.stringify({ error: upsertErr.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ ok: true, userId }), { status: 200, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});