import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  public async sendLoginEmail(email: string) {
    const today = new Date();
    
    void this.mailerService 
      .sendMail({
        to: email,
        from: '<no-reply@enodya.com>',
        subject: 'Login notification',
        template: 'login',
        context: {email, today} 
      })
      .catch((error: unknown) => {
        console.error('Failed to send login notification email', error);
      });
  }
  public async sendVerifyEmailTemplate(email: string, link:string) {
    
    void this.mailerService 
      .sendMail({
        to: email,
        from: '<no-reply@enodya.com>',
        subject: 'Verify your account',
        template: 'verify-email',
        context: {link} 
      })
      .catch((error: unknown) => {
        console.error('Failed to send login notification email', error);
      });
  }
}
