import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPageReadyEmail({
  to,
  nome1,
  nome2,
  tituloFilme,
  pageUrl,
}: {
  to: string;
  nome1: string;
  nome2: string;
  tituloFilme: string;
  pageUrl: string;
}) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "BMM Love <onboarding@resend.dev>",
    to,
    subject: `Seu presente está pronto, ${nome1}! 💕`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#13131f;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e0d18,#2a0f20);padding:36px 32px;text-align:center;">
            <div style="display:inline-block;background:rgba(232,24,90,0.15);border:1px solid rgba(232,24,90,0.3);border-radius:50px;padding:6px 18px;margin-bottom:20px;">
              <span style="color:#E8185A;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Presente Especial</span>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;line-height:1.2;">${tituloFilme}</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.5);font-size:14px;">A história de <strong style="color:#fff;">${nome1} & ${nome2}</strong> está no ar 💕</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;">Olá, <strong style="color:#fff;">${nome1}</strong>!</p>
            <p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;">
              Sua página especial foi criada com sucesso. Clique no botão abaixo para acessá-la e compartilhar com <strong style="color:#fff;">${nome2}</strong>.
            </p>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:8px 0 28px;">
                  <a href="${pageUrl}"
                    style="display:inline-block;background:#E8185A;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:14px 36px;border-radius:50px;letter-spacing:0.3px;">
                    Abrir minha página ♥
                  </a>
                </td>
              </tr>
            </table>

            <!-- Link copiável -->
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 16px;">
              <p style="margin:0 0 6px;color:rgba(255,255,255,0.35);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Link direto</p>
              <p style="margin:0;color:#E8185A;font-size:12px;font-family:monospace;word-break:break-all;">${pageUrl}</p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 32px 28px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="margin:20px 0 0;color:rgba(255,255,255,0.2);font-size:12px;">
              <strong style="color:#E8185A;">BMM</strong>LOVE · Feito com ❤️
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
