const getChannel = require('./getChannel');
const mailService = require('../services/mail.service');

const queueName = 'email';

async function messageQueue() {
    const channel = await getChannel();
    try {
        await channel.assertQueue(queueName, { durable: false });

        channel.consume(queueName, async (json) => {
            if (!json) return;
            const { userEmail, subject, text } = JSON.parse(json.content.toString());
            mailService.sendMail(userEmail, subject, text);
            channel.ack(json);
        });

    } catch (error) {
        deleteQueue(channel, queueName);
        console.error(error);
    }
}

async function sendMailToQueue({ userEmail, subject, text }) {
    const channel = await getChannel();
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify({ userEmail, subject, text })), { persistent: true });
}

async function deleteQueue(channel, queueName) {
    await channel.queueDelete(queueName);
    console.log(`${queueName} deleted.`);
    await connection.close();
}



module.exports = {
    messageQueue,
    sendMailToQueue
}