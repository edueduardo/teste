import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendConsultationConfirmation(
  email: string,
  name: string,
  lawyerName: string,
  consultationDate: Date,
  consultationTitle: string
) {
  try {
    const result = await resend.emails.send({
      from: "noreply@meuadvogado.com",
      to: email,
      subject: "Consulta Confirmada - Meu Advogado",
      html: `
        <h1>Consulta Confirmada!</h1>
        <p>Olá ${name},</p>
        <p>Sua consulta com <strong>${lawyerName}</strong> foi confirmada.</p>
        <p><strong>Data:</strong> ${consultationDate.toLocaleDateString("pt-BR")} às ${consultationDate.toLocaleTimeString("pt-BR")}</p>
        <p><strong>Assunto:</strong> ${consultationTitle}</p>
        <p>Acesse seu dashboard para mais detalhes.</p>
        <p>Atenciosamente,<br/>Equipe Meu Advogado</p>
      `,
    })

    return result
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    throw error
  }
}

export async function sendConsultationReminder(
  email: string,
  name: string,
  lawyerName: string,
  consultationDate: Date
) {
  try {
    const result = await resend.emails.send({
      from: "noreply@meuadvogado.com",
      to: email,
      subject: "Lembrete: Sua Consulta com " + lawyerName,
      html: `
        <h1>Lembrete de Consulta</h1>
        <p>Olá ${name},</p>
        <p>Você tem uma consulta agendada com <strong>${lawyerName}</strong> em:</p>
        <p><strong>${consultationDate.toLocaleDateString("pt-BR")} às ${consultationDate.toLocaleTimeString("pt-BR")}</strong></p>
        <p>Não se esqueça! Acesse seu dashboard para confirmar presença.</p>
        <p>Atenciosamente,<br/>Equipe Meu Advogado</p>
      `,
    })

    return result
  } catch (error) {
    console.error("Erro ao enviar lembrete:", error)
    throw error
  }
}

export async function sendPaymentReceipt(
  email: string,
  name: string,
  amount: number,
  consultationTitle: string,
  transactionId: string
) {
  try {
    const result = await resend.emails.send({
      from: "noreply@meuadvogado.com",
      to: email,
      subject: "Recibo de Pagamento - Meu Advogado",
      html: `
        <h1>Recibo de Pagamento</h1>
        <p>Olá ${name},</p>
        <p>Seu pagamento foi processado com sucesso!</p>
        <p><strong>Valor:</strong> R$ ${(amount / 100).toFixed(2)}</p>
        <p><strong>Serviço:</strong> ${consultationTitle}</p>
        <p><strong>ID da Transação:</strong> ${transactionId}</p>
        <p>Você pode acompanhar sua consulta no dashboard.</p>
        <p>Atenciosamente,<br/>Equipe Meu Advogado</p>
      `,
    })

    return result
  } catch (error) {
    console.error("Erro ao enviar recibo:", error)
    throw error
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: string
) {
  try {
    const roleText = role === "LAWYER" ? "advogado" : "cliente"
    const result = await resend.emails.send({
      from: "noreply@meuadvogado.com",
      to: email,
      subject: "Bem-vindo ao Meu Advogado!",
      html: `
        <h1>Bem-vindo ao Meu Advogado!</h1>
        <p>Olá ${name},</p>
        <p>Sua conta de ${roleText} foi criada com sucesso!</p>
        <p>Acesse seu dashboard para começar.</p>
        <p>Atenciosamente,<br/>Equipe Meu Advogado</p>
      `,
    })

    return result
  } catch (error) {
    console.error("Erro ao enviar welcome email:", error)
    throw error
  }
}
