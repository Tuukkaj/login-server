import nodeMailer, { Transporter } from "nodemailer";

interface EmailResponse {
  messageId: string
}

class Mailer {
  private transporter: Transporter | undefined; 

  sendSignUp = async (to: string, token: string): Promise<void> =>  {
    return ; 

    // Will be done later
    return await this.transporter?.sendMail({
      to, 
      from: `Quacker <${process.env.SMTP_API_USER}>`,
      subject: "Verify email",
      html: `<a href="http://localhost/sign/verify${process.env.PORT}/${token}">Verify</a>`
    });
  }

  init = () => { 
    this.transporter = nodeMailer.createTransport({
      service: "SendinBlue",
      auth: {
        user: process.env.SMTP_API_USER, 
        pass: process.env.SMTP_API_KEY
      }
    }); 
  }
}

export default new Mailer(); 