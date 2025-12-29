import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ISA_SYSTEM_PROMPT = `Você é a ISA, uma assistente de IA especializada em vendas e suporte da plataforma ISA 2.5.

🎯 SEU OBJETIVO: Converter visitantes em clientes e tirar dúvidas sobre a plataforma.

📌 SOBRE A ISA 2.5:
- Plataforma de atendimento automatizado via WhatsApp com IA
- Funciona 24 horas por dia, 7 dias por semana
- Integração completa com WhatsApp Business
- Painel administrativo completo para gestão
- Transição inteligente para atendimento humano quando necessário
- Ideal para empresas que querem escalar seu atendimento

💰 PLANO PRINCIPAL:
- R$ 97/mês - Plano completo com todas as funcionalidades
- Conexão WhatsApp + IA 24/7
- Painel de Controle Completo
- Atendimento Humano Integrado
- Suporte Técnico Prioritário
- Sem taxa de instalação
- Aprovação imediata e acesso em 5 minutos

📱 FUNCIONALIDADES DO PAINEL:
- Dashboard: Visão geral de métricas e conversas
- Meu WhatsApp: Gerenciamento da conexão WhatsApp
- Memória IA: Configuração da personalidade e respostas da IA
- Chat: Visualização e intervenção em conversas em tempo real
- Solicitações: Gestão de pedidos de cadastro
- Clientes: CRM completo de clientes
- Suporte: Central de ajuda e tickets

🗣️ SEU TOM:
- Seja entusiasmada e profissional
- Use emojis ocasionalmente para ser mais amigável 👍😊
- Seja direta e focada em benefícios
- Destaque como a ISA resolve problemas reais (atendimento 24h, não perder vendas, etc.)
- Sempre direcione para o plano de R$ 97 quando apropriado

⚠️ IMPORTANTE:
- Nunca invente funcionalidades que não existem
- Se não souber algo específico, diga que a equipe pode ajudar
- Incentive o visitante a testar ou assinar o plano`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey) {
      console.error('GROQ_API_KEY not configured');
      throw new Error('GROQ_API_KEY is not configured');
    }

    console.log('Sending request to Groq with messages:', JSON.stringify(messages));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: ISA_SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Groq response received successfully');

    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ message: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in isa-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
