require("dotenv").config()
const express = require('express');
const errorHandler = require("./middlewares/errorHandler.middleware");
const settingsService = require("./services/settings.service");
const settings = require("./settings");
const queue = require('./queue');
const app = express();
const port = process.env.PORT || 3000;

let count = 0;

async function run() {
    if (count > 3) {
        console.log('Server could not start');
        process.exit(1);
    }
    try {
        await queue.messageQueue()
        await settingsService.createSetting(settings);
        //await queue.sendMailToQueue({ userEmail: 'pi.emree@gmail.com', subject: 'Mail Subject', text: 'mail text' });

        app.use(express.json());

        app.use('/api', require('./router'));
        app.use(errorHandler);
        app.listen(port, async () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.log(`server could not start. Error: ${error.message}, try: ${count}`);
        setTimeout(run, 3000);
    }
    count++;
}

run();