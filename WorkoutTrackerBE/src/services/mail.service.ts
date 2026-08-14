import nodemailer, { Transporter } from "nodemailer";
import { config, isSmtpConfigured } from "../config/env";
import { logger } from "../config/logger";
import { AppError, ErrorCodes } from "../errors/appError";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

/** Real SMTP delivery. */
class SmtpMailer implements Mailer {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }

  async send(message: MailMessage): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.smtp.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      logger.info({ to: message.to, subject: message.subject }, "Mail sent");
    } catch (error) {
      logger.error({ err: error, to: message.to }, "Mail delivery failed");
      throw new AppError("MailSendFailed", 502, ErrorCodes.MAIL_SEND_FAILED);
    }
  }
}

/**
 * Development fallback: prints the message instead of sending it. Refuses to be
 * used in production so a missing SMTP config fails loudly at boot rather than
 * silently swallowing every password reset.
 */
class ConsoleMailer implements Mailer {
  async send(message: MailMessage): Promise<void> {
    logger.warn(
      { to: message.to, subject: message.subject, body: message.text },
      "SMTP is not configured — mail printed to the log instead of being sent"
    );
  }
}

let mailer: Mailer | null = null;

export const getMailer = (): Mailer => {
  if (mailer) return mailer;

  if (isSmtpConfigured()) {
    mailer = new SmtpMailer();
  } else {
    if (config.isProduction) {
      throw new Error(
        "[config] SMTP_HOST/SMTP_USER/SMTP_PASS must be set in production: " +
          "password reset mails cannot be delivered without them."
      );
    }
    mailer = new ConsoleMailer();
  }

  return mailer;
};

/** Test seam — lets suites swap in a recording mailer. */
export const setMailer = (custom: Mailer | null): void => {
  mailer = custom;
};

export const buildOtpMail = (
  to: string,
  fullName: string,
  otpCode: string,
  ttlMinutes: number
): MailMessage => ({
  to,
  subject: `Mã đặt lại mật khẩu Workout Tracker: ${otpCode}`,
  text:
    `Xin chào ${fullName},\n\n` +
    `Mã xác thực đặt lại mật khẩu của bạn là: ${otpCode}\n` +
    `Mã có hiệu lực trong ${ttlMinutes} phút.\n\n` +
    `Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.`,
  html:
    `<p>Xin chào <strong>${fullName}</strong>,</p>` +
    `<p>Mã xác thực đặt lại mật khẩu của bạn là:</p>` +
    `<p style="font-size:28px;letter-spacing:6px;font-weight:700">${otpCode}</p>` +
    `<p>Mã có hiệu lực trong ${ttlMinutes} phút.</p>` +
    `<p style="color:#666">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>`,
});
