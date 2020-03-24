import nodemailer from 'nodemailer'

export enum MailType {
  ConfirmationEmail,
  ForgotPasswordEmail,
}

export async function sendEmail(
  email: string,
  url: string,
  type = MailType.ConfirmationEmail
): Promise<void> {
  let transporter

  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  } else {
    const testAccount = await nodemailer.createTestAccount()

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    })
  }

  let info

  if (type === MailType.ConfirmationEmail) {
    info = await transporter.sendMail({
      from: `"Coderplex " <${process.env.EMAIL_ID}>`,
      to: email,
      subject: 'Verify your email - Coderplex',
      text: `${url}`,
      html: `<a href="${url}">Verify Email</a>`,
    })
  } else if (type === MailType.ForgotPasswordEmail) {
    info = await transporter.sendMail({
      from: `"Coderplex " <${process.env.EMAIL_ID}>`,
      to: email,
      subject: 'Change Password - Coderplex', // Subject line
      text: `${url}`,
      html: `<a href="${url}">Change Password</a>`,
    })
  }

  console.log('Message sent: %s', info.messageId)
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}
