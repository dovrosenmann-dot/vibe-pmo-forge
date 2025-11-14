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
  notificationType: "role" | "project_access";
  roleName?: string;
  projectName?: string;
  projectCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, userName, notificationType, roleName, projectName, projectCode }: NotificationRequest = await req.json();

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
