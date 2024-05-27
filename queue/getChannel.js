const amqp = require('amqplib');

async function getChannel() {
    const connection = await amqp.connect(process.env.MQ_URL);
    return connection.createChannel()
}

module.exports = getChannel