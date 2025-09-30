import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

import { passwordRecovery } from './letters/passwordRecovery';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(to: string, link: string) {
    await this.mailerService.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject: 'Восстановление пароля',
      html: passwordRecovery({ link })
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
