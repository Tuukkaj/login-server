import nodeMailer, { Transporter } from "nodemailer";

interface EmailResponse {
  messageId: string
}

class Mailer {
  private transporter: Transporter | undefined;

  sendSignUp = async (to: string, token: string): Promise<void> => {
    await this.transporter?.sendMail({
      to,
      subject: "Quacker Verify email",
      html: `<a href="http://localhost:${process.env.PORT}/authentication/sign/verify/${token}">Verify</a>`
    });
  }

  init = async () => {
    this.transporter = nodeMailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const verificationResult = await this.transporter.verify();

    if (!verificationResult) {
      console.error("Failed to verify email connection")
      process.exit(1)
    }
  }
}

export default new Mailer(); 