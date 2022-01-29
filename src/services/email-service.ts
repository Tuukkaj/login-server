import nodeMailer, { Transporter } from "nodemailer";

interface EmailResponse {
  messageId: string
}


class Mailer {
  private transporter: Transporter | undefined;
  private host: string | undefined;

  sendSignUp = async (to: string, token: string): Promise<void> => {
    console.info(`${this.host}/authentication/sign/verify/${token}`);

    await this.transporter?.sendMail({
      to: process.env.SMTP_USER, // to, For dev usage until real SMTP server is completed.
      subject: "Quacker Verify email",
      html: `<a href="${this.host}/authentication/sign/verify/${token}">Verify</a>`
    });
  }

  sendForgotPassword = async (to: string, token: string) => {
    await this.transporter?.sendMail({
      to: process.env.SMTP_USER, // to, For dev usage until real SMTP server is completed.
      subject: "Quacker reset password",
      html: `Password reset - token: ${token} email: ${to}`
    });
  }

  init = async () => {
    this.host = process.env.NODE_ENV === "production" ? process.env.HOST : `http://localhost:${process.env.PORT}`;

    this.transporter = nodeMailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const verificationResult = await this.transporter.verify();

    if (!verificationResult) {
      console.error("Failed to verify email connection");
      process.exit(1);
    }
  }
}

export default new Mailer();