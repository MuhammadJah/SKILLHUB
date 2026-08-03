import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const SB = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const { action } = body;

    // ── SUBMIT BID ──────────────────────────────────────────
    if (action === 'submit_bid') {
      const { job_id, provider_id, pitch_message, estimated_cost, estimated_duration } = body;

      if (!job_id || !provider_id || !pitch_message) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: CORS });
      }

      const { data, error } = await SB.rpc('submit_bid', {
        p_job_id: job_id,
        p_provider_id: provider_id,
        p_pitch: pitch_message,
        p_cost: estimated_cost || null,
        p_duration: estimated_duration || null
      });

      if (error) throw error;
      if (data?.error) return new Response(JSON.stringify({ error: data.error }), { status: 400, headers: CORS });

      // WhatsApp notification to admin
      const twilioSid = Deno.env.get('TWILIO_SID');
      const twilioToken = Deno.env.get('TWILIO_TOKEN');
      const adminPhone = Deno.env.get('ADMIN_PHONE');
      const twilioFrom = Deno.env.get('TWILIO_WHATSAPP_FROM') || 'whatsapp:+14155238886';

      if (twilioSid && twilioToken && adminPhone) {
        const msg = `📋 *GamSkillHub* — New bid submitted on job. Bid count: ${data.bid_count}/5. ${data.job_status === 'bidding_closed' ? '🔒 Job now CLOSED (5 bids reached).' : ''}`.trim();
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: { 'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioToken}`), 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ From: twilioFrom, To: `whatsapp:${adminPhone}`, Body: msg })
        });
      }

      return new Response(JSON.stringify(data), { headers: CORS });
    }

    // ── ACCEPT BID ──────────────────────────────────────────
    if (action === 'accept_bid') {
      const { bid_id, client_id } = body;
      const { data, error } = await SB.rpc('accept_bid', { p_bid_id: bid_id, p_client_id: client_id });
      if (error) throw error;
      if (data?.error) return new Response(JSON.stringify({ error: data.error }), { status: 400, headers: CORS });
      return new Response(JSON.stringify(data), { headers: CORS });
    }

    // ── POST JOB ────────────────────────────────────────────
    if (action === 'post_job') {
      const { client_id, category, title, description, location_area, location_district,
              urgency_timeline, budget_min, budget_max, media_urls, is_anonymous } = body;

      const { data, error } = await SB.from('jobs').insert([{
        client_id, category, title, description,
        location_area, location_district: location_district || 'Banjul',
        urgency_timeline: urgency_timeline || 'Within a week',
        budget_min: budget_min || null, budget_max: budget_max || null,
        media_urls: media_urls || [], is_anonymous: is_anonymous !== false
      }]).select().single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, job: data }), { headers: CORS });
    }

    // ── COMPLETE JOB ────────────────────────────────────────
    if (action === 'complete_job') {
      const { job_id, client_id } = body;
      const { data, error } = await SB.rpc('complete_job', { p_job_id: job_id, p_client_id: client_id });
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: CORS });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: CORS });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS });
  }
});
