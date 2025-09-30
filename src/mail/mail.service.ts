import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(to: string, link: string) {
    await this.mailerService.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject: 'Восстановление пароля',
      html: `
        <p>Вы запросили восстановление пароля.</p>
        <p>Ссылка действительна 30 минут:</p>
        <p><a href="${link}">${link}</a></p>
      `
    });
  }

  async sendPasswordChangedEmail(to: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Пароль изменён',
      html: `
        <p>Ваш пароль был успешно изменён.</p>
        <p>Если это были не вы, обратитесь в поддержку!</p>
      `
    });
  }
}
