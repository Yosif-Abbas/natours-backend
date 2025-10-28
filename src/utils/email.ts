import nodemailer from 'nodemailer';
import pug from 'pug';
import htmlToText from 'html-to-text';
import { IUser } from '../types/user';
import { IEmail } from '../types/email';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export default class Email implements IEmail {
  from: string;
  to: string;
  firstName: string;
  url: string;

  constructor(user: IUser, url: string) {
    this.from = `Natours <${process.env.EMAIL_FROM}>`;
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  static newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    } as SMTPTransport.Options);
  }

  async send(template: string, subject: string) {
    const html = pug.renderFile(`${__dirname}/../emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.convert(html, { wordwrap: 80 }),
    };

    await Email.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!.');
  }

  async sendResetPassword() {
    await this.send('passwordReset', 'Reset your password using the link');
  }
}
