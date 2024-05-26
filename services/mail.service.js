const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.mail = process.env.MAIL;
        this.password = process.env.MAIL_PASSWORD;

        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: 'gmail',
            auth: {
                user: this.mail,
                pass: this.password,
            }
        });
    }
    sendMail = async (userEmail, subject, text) => {
        return await this.transporter.sendMail({
            from: `<${this.mail}>`,
            to: userEmail,
            subject,
            text
        })
    }
}

module.exports = new MailService();