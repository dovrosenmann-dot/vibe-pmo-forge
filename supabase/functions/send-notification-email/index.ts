import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  to: string;
  userName: string;
  notificationType: "role" | "project_access" | "transaction_approved" | "transaction_rejected";
  roleName?: string;
  projectName?: string;
  projectCode?: string;
  transactionDescription?: string;
  transactionAmount?: number;
  transactionCurrency?: string;
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      userName, 
      notificationType, 
      roleName, 
      projectName, 
      projectCode,
      transactionDescription,
      transactionAmount,
      transactionCurrency,
      rejectionReason
    }: NotificationRequest = await req.json();

    let subject = "";
    let html = "";

    if (notificationType === "role") {
      subject = "Nova permissão atribuída";
      html = `
        <h1>Olá, ${userName}!</h1>
        <p>Você recebeu uma nova permissão no sistema:</p>
        <p><strong>Permissão:</strong> ${roleName}</p>
        <p>Faça login para acessar suas novas funcionalidades.</p>
        <p>Atenciosamente,<br>Equipe de Administração</p>
      `;
    } else if (notificationType === "project_access") {
      subject = "Acesso a projeto concedido";
      html = `
        <h1>Olá, ${userName}!</h1>
        <p>Você recebeu acesso a um novo projeto:</p>
        <p><strong>Projeto:</strong> ${projectCode} - ${projectName}</p>
        <p>Faça login para visualizar e gerenciar este projeto.</p>
        <p>Atenciosamente,<br>Equipe de Administração</p>
      `;
    } else if (notificationType === "transaction_approved") {
      const formattedAmount = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: transactionCurrency || 'USD' 
      }).format(transactionAmount || 0);
      
      subject = "Transação aprovada";
      html = `
        <h1>Olá, ${userName}!</h1>
        <p>Sua transação financeira foi <strong style="color: green;">aprovada</strong>:</p>
        <table style="border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Projeto:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${projectCode} - ${projectName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Descrição:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${transactionDescription}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Valor:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formattedAmount}</td>
          </tr>
        </table>
        <p>Atenciosamente,<br>Equipe Financeira</p>
      `;
    } else if (notificationType === "transaction_rejected") {
      const formattedAmount = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: transactionCurrency || 'USD' 
      }).format(transactionAmount || 0);
      
      subject = "Transação rejeitada";
      html = `
        <h1>Olá, ${userName}!</h1>
        <p>Sua transação financeira foi <strong style="color: red;">rejeitada</strong>:</p>
        <table style="border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Projeto:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${projectCode} - ${projectName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Descrição:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${transactionDescription}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Valor:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Motivo da rejeição:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${rejectionReason}</td>
          </tr>
        </table>
        <p>Por favor, revise a transação e faça os ajustes necessários.</p>
        <p>Atenciosamente,<br>Equipe Financeira</p>
      `;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Sistema de Gestão <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email enviado com sucesso:", emailData);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
