const getChannel = require('./getChannel');
const mailService = require('../services/mail.service');

const queueName = 'email';

async function messageQueue() {
    const channel = await getChannel();
    await channel.assertQueue(queueName, { durable: false });
    channel.consume(queueName, mailConsumer);
    return channel;
}

async function mailConsumer(json) {
    const channel = await getChannel();
    const { userEmail, subject, text } = JSON.parse(json.content.toString());
    mailService.sendMail(userEmail, subject, text);
    channel.ack(json);
}

async function sendMailToQueue({ userEmail, subject, text }) {
    const channel = await getChannel();
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify({ userEmail, subject, text })), { persistent: true });
}





module.exports = {
    messageQueue,
    sendMailToQueue,
}