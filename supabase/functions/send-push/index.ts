// supabase/functions/send-push/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push@3.6.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-trigger-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:contato@contratamatch.com'
    const triggerToken = Deno.env.get('TRIGGER_TOKEN')

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

    // Cliente Supabase com service_role (a Edge Function tem essa permissão automaticamente)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()
    const { company_id, candidate_name, job_title, application_id, test } = body

    // ═══ MODO TESTE: usuário autenticado pode testar pra ele mesmo ═══
    if (test) {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Não autenticado' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Valida o usuário
      const { data: { user }, error: userErr } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (userErr || !user) {
        return new Response(JSON.stringify({ error: 'Token inválido' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user.id)

      if (!subs || subs.length === 0) {
        return new Response(JSON.stringify({ error: 'Sem subscriptions' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const results = await Promise.allSettled(subs.map(sub => sendPush(sub, {
        title: '🎉 Notificações ativadas!',
        body: 'Você vai receber alertas quando alguém se candidatar a uma vaga.',
        url: '/'
      })))

      return new Response(JSON.stringify({
        sent: results.filter(r => r.status === 'fulfilled').length,
        total: subs.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ═══ MODO PRODUÇÃO: SÓ aceita requests do trigger com token correto ═══
    const incomingToken = req.headers.get('X-Trigger-Token')
    if (!triggerToken || incomingToken !== triggerToken) {
      return new Response(JSON.stringify({ error: 'Acesso negado' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Busca subscriptions da company
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('company_id', company_id)

    if (error) throw error
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const payload = {
      title: '✨ Novo candidato!',
      body: `${candidate_name} se candidatou para ${job_title}`,
      url: '/?view=adminDashboard&adminView=candidates',
      application_id
    }

    const results = await Promise.allSettled(
      subscriptions.map(sub => sendPush(sub, payload))
    )

    // Remove subscriptions expiradas (410 Gone)
    const expired: string[] = []
    results.forEach((result, i) => {
      if (result.status === 'rejected' && (result.reason as any)?.statusCode === 410) {
        expired.push(subscriptions[i].id)
      }
    })
    if (expired.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', expired)
    }

    return new Response(JSON.stringify({
      sent: results.filter(r => r.status === 'fulfilled').length,
      total: subscriptions.length,
      expired: expired.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function sendPush(subscription: any, payload: any) {
  return await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    },
    JSON.stringify(payload)
  )
}