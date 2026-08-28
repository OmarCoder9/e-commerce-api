import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  public async sendLoginEmail(user: User) {
    const today = new Date();
    void this.mailerService
      .sendMail({
        to: user.email,
        from: '<no-reply@enodya.com>',
        subject: 'Login notification',
        html: `
                  <div>
                    <h2>Hi ${user.username}</h2>
                    <p>
                      You logged in to your account on ${today.toDateString()} at ${today.toLocaleTimeString()}.
                    </p>
                  </div>
                `,
      })
      .catch((error: unknown) => {
        console.error('Failed to send login notification email', error);
      });
  }
}
