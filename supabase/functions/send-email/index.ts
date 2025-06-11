
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  type: 'test' | 'event_reminder' | 'payment_due' | 'team_invitation' | 'report';
  data: any;
}

const getEmailTemplate = (type: string, data: any) => {
  switch (type) {
    case 'test':
      return {
        subject: 'Teste de Notificação - Sistema Financeiro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Teste de Email</h1>
            <p>Este é um email de teste do seu sistema de notificações.</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Este email foi enviado automaticamente pelo sistema.
            </p>
          </div>
        `
      };

    case 'event_reminder':
      return {
        subject: `Lembrete: ${data.eventTitle} - ${data.date}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">📅 Lembrete de Evento</h1>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin: 0 0 10px 0; color: #495057;">${data.eventTitle}</h2>
              <p><strong>Data:</strong> ${data.date}</p>
              <p><strong>Local:</strong> ${data.location || 'Não informado'}</p>
              <p><strong>Cliente:</strong> ${data.client || 'Não informado'}</p>
            </div>
            <p>Este evento está se aproximando. Certifique-se de estar preparado!</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Este lembrete foi configurado em suas preferências de notificação.
            </p>
          </div>
        `
      };

    case 'payment_due':
      return {
        subject: `⚠️ Pagamento Pendente - ${data.description}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc3545;">💳 Pagamento Pendente</h1>
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h2 style="margin: 0 0 10px 0; color: #856404;">${data.description}</h2>
              <p><strong>Valor:</strong> R$ ${data.amount}</p>
              <p><strong>Vencimento:</strong> ${data.dueDate}</p>
              <p><strong>Cliente:</strong> ${data.client || 'Não informado'}</p>
            </div>
            <p>Este pagamento está próximo do vencimento. Verifique o status e tome as ações necessárias.</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Este lembrete foi configurado em suas preferências de notificação.
            </p>
          </div>
        `
      };

    case 'team_invitation':
      return {
        subject: `Convite para Equipe - ${data.teamName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #28a745;">👥 Convite para Equipe</h1>
            <p>Você foi convidado para fazer parte da equipe <strong>${data.teamName}</strong>!</p>
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Convidado por:</strong> ${data.invitedBy}</p>
              <p><strong>Função:</strong> ${data.role}</p>
              <p><strong>Mensagem:</strong> ${data.message || 'Bem-vindo à equipe!'}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.inviteLink}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Aceitar Convite
              </a>
            </div>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Este convite expira em 7 dias. Se você não solicitou este convite, ignore este email.
            </p>
          </div>
        `
      };

    case 'report':
      return {
        subject: `📊 Relatório ${data.reportType} - ${data.period}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6f42c1;">📊 Relatório Automático</h1>
            <p>Seu relatório ${data.reportType} do período ${data.period} está pronto!</p>
            <div style="background: #e7e3fc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0;">Resumo:</h3>
              <p><strong>Receitas:</strong> R$ ${data.summary?.income || '0,00'}</p>
              <p><strong>Despesas:</strong> R$ ${data.summary?.expenses || '0,00'}</p>
              <p><strong>Lucro:</strong> R$ ${data.summary?.profit || '0,00'}</p>
            </div>
            <p>Acesse o sistema para visualizar o relatório completo e fazer o download.</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Este relatório foi gerado automaticamente conforme suas configurações.
            </p>
          </div>
        `
      };

    default:
      return {
        subject: 'Notificação do Sistema',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Notificação</h1>
            <p>${data.message || 'Você recebeu uma nova notificação.'}</p>
          </div>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, data }: EmailRequest = await req.json();

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const template = getEmailTemplate(type, data);

    console.log(`Sending ${type} email to ${to}`);

    const emailResponse = await resend.emails.send({
      from: 'Sistema Financeiro <onboarding@resend.dev>',
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
