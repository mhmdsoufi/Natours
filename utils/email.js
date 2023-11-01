import { createTransport } from 'nodemailer';
import { renderFile } from 'pug';
import { htmlToText } from 'html-to-text';
// import { options } from '../routes/tourRoutes';
import mailgunTransport from 'nodemailer-mailgun-transport';

export default class Email {
  constructor(user, url) {
    (this.to = user.email),
      (this.firstName = user.name.split(' ')[0]),
      (this.url = url),
      (this.from = `Mhd Soufi <${process.env.EMAIL_FROM}>`);
  }

  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      // const mailgunOptions = {
      //   auth: {
      //     api_key: process.env.MAILGUN_ACTIVE_API_KEY,
      //     domain: process.env.MAILGUN_DOMAIN,
      //   },
      // };
      // const transport = mailgunTransport(mailgunOptions);
      // console.log('trans', transport);
      // return nodemailer.createTransport(transport);

      //SendGrid
      // return nodemailer.createTransport({
      //   service: 'SendGrid',
      //   auth: {
      //     user: process.env.SENDGRID_USERNAME,
      //     pass: process.env.SENDGRID_PASSWORD,
      //   },
      // });

      // mailtrap
      return createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    return createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //1) Render html page
    const html = renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    //2)Define Email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    // 3) Create a transporter and send email
    await this.newTransporter().sendMail(mailOptions);
  }

  //welcome email
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  //
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
