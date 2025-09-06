import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOKS] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeSecretKey || !webhookSecret) {
    const msg = "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET";
    console.error(msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const priceIds = {
    PRO_PROMO: Deno.env.get("STRIPE_PRICE_ID_PRO_PROMO") || "",
    PRO_STANDARD: Deno.env.get("STRIPE_PRICE_ID_PRO_STANDARD") || "",
    WEEKLY: Deno.env.get("STRIPE_PRICE_ID_WEEKLY") || "",
    ANNUAL: Deno.env.get("STRIPE_PRICE_ID_ANNUAL") || "",
  };

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

  // Read the raw body for signature verification
  const body = await req.arrayBuffer();
  const rawBody = new TextDecoder("utf-8").decode(body);
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, webhookSecret);
    logStep("Webhook verified", { type: event.type });
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }

  // Supabase clients: service role for DB writes, anon for auth helpers if needed
  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const mapPriceToPlan = (priceId: string | null | undefined): string => {
    if (!priceId) return "free";
    switch (priceId) {
      case priceIds.PRO_PROMO:
        return "pro_promo";
      case priceIds.PRO_STANDARD:
        return "pro_standard";
      case priceIds.WEEKLY:
        return "weekly";
      case priceIds.ANNUAL:
        return "annual";
      default:
        return "pro_standard"; // default paid plan
    }
  };

  const upsertSubscription = async (params: {
    userId: string;
    customerId: string;
    subscriptionId: string;
    status: string;
    priceId: string | null;
    periodStart?: number | null;
    periodEnd?: number | null;
  }) => {
    const { userId, customerId, subscriptionId, status, priceId, periodStart, periodEnd } = params;
    const plan = mapPriceToPlan(priceId || undefined);

    const { error } = await supabaseService.from("billing_subscriptions").upsert({
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
      status,
      price_id: priceId || null,
      plan,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "stripe_subscription_id" });

    if (error) logStep("Upsert billing_subscriptions error", { error: error.message });

    const profileUpdate: any = {
      stripe_customer_id: customerId,
      plan,
      subscription_status: status,
    };
    if (periodEnd) profileUpdate.subscription_current_period_end = new Date(periodEnd * 1000).toISOString();

    const { error: profErr } = await supabaseService
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);

    if (profErr) logStep("Update profiles error", { error: profErr.message });
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const email = session.customer_details?.email || session.customer_email || null;
        logStep("checkout.session.completed", { customerId, subscriptionId, email });

        if (!email) break;
        // Find user profile by email
        const { data: profile, error: profErr } = await supabaseService
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (profErr || !profile?.id) {
          logStep("Profile not found for email", { email, error: profErr?.message });
          break;
        }

        // Retrieve subscription to get price/periods
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const item = subscription.items.data[0];
        const priceId = item?.price?.id || null;
        await upsertSubscription({
          userId: profile.id,
          customerId,
          subscriptionId,
          status: subscription.status,
          priceId,
          periodStart: subscription.current_period_start,
          periodEnd: subscription.current_period_end,
        });
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const item = subscription.items.data[0];
        const priceId = item?.price?.id || null;
        logStep("customer.subscription.updated", { customerId, subscriptionId, status, priceId });

        // Find user by stripe_customer_id
        const { data: profile, error: profErr } = await supabaseService
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (profErr || !profile?.id) {
          logStep("Profile not found for customer", { customerId, error: profErr?.message });
          break;
        }

        await upsertSubscription({
          userId: profile.id,
          customerId,
          subscriptionId,
          status,
          priceId,
          periodStart: subscription.current_period_start,
          periodEnd: subscription.current_period_end,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        logStep("customer.subscription.deleted", { customerId, subscriptionId });

        // Find user by stripe_customer_id
        const { data: profile, error: profErr } = await supabaseService
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (profErr || !profile?.id) {
          logStep("Profile not found for customer", { customerId, error: profErr?.message });
          break;
        }

        // Mark as canceled / free
        const { error } = await supabaseService
          .from("billing_subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscriptionId);
        if (error) logStep("Update billing_subscriptions canceled error", { error: error.message });

        const { error: profUpdErr } = await supabaseService
          .from("profiles")
          .update({ plan: "free", subscription_status: "canceled" })
          .eq("id", profile.id);
        if (profUpdErr) logStep("Update profile to free error", { error: profUpdErr.message });
        break;
      }
      default:
        logStep("Unhandled event", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR handling webhook", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});