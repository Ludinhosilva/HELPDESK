import { prisma } from "@/core/prisma";

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  type: string;
  organizationId: string;
  ticketId?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { to, subject, body, type, organizationId, ticketId } = params;

  await prisma.emailLog.create({
    data: {
      to,
      subject,
      body,
      type,
      organizationId,
      ticketId: ticketId ?? null,
      sentAt: new Date(),
    },
  });

  console.log(`[EMAIL] (${type}) To: ${to} | Subject: ${subject}`);
}
