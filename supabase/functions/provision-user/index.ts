// Supabase Edge Function: provision-user
// Creates an Auth user (if missing) for an existing client/admin based on matricula.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  loginType: "admin" | "client";
  matricula: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const body = (await req.json()) as Partial<Body>;

    const loginType = body.loginType;
    const matricula = (body.matricula ?? "").replace(/\D/g, "");

    if (loginType !== "admin" && loginType !== "client") {
      return new Response(JSON.stringify({ error: "Invalid loginType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (loginType === "admin" && matricula.length !== 7) {
      return new Response(JSON.stringify({ error: "Invalid matricula" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (loginType === "client" && matricula.length !== 6) {
      return new Response(JSON.stringify({ error: "Invalid matricula" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Lookup record in the correct table
    let email = "";
    let password = "";
    let fullName = "";

    if (loginType === "client") {
      const { data, error } = await admin
        .from("clients")
        .select("email, cpf, full_name, status, is_active")
        .eq("matricula", matricula)
        .maybeSingle();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Client not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!data.is_active || data.status !== "active") {
        return new Response(JSON.stringify({ error: "Client inactive" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      email = data.email;
      password = (data.cpf ?? "").replace(/\D/g, "");
      fullName = data.full_name;
    } else {
      const { data, error } = await admin
        .from("admins")
        .select("email, cpf, full_name, is_active")
        .eq("matricula", matricula)
        .maybeSingle();

      if (error || !data) {
        return new Response(JSON.stringify({ error: "Admin not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!data.is_active) {
        return new Response(JSON.stringify({ error: "Admin inactive" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      email = data.email;
      password = (data.cpf ?? "").replace(/\D/g, "");
      fullName = data.full_name;
    }

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Missing email/cpf" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create auth user if missing. If already exists, ignore.
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      const msg = (createError.message ?? "").toLowerCase();
      const alreadyExists = msg.includes("already") || msg.includes("exists") || msg.includes("registered");
      if (!alreadyExists) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
