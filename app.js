require("dotenv").config()
const express = require('express');
const errorHandler = require("./middlewares/errorHandler.middleware");
const settingsService = require("./services/settings.service");
const settings = require("./settings");
const queue = require('./queue');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

queue.messageQueue();


app.use('/api', require('./router'));
app.use(errorHandler);

app.listen(port, async () => {
    await settingsService.createSetting(settings);
    //await queue.sendMailToQueue({ userEmail: 'pi.emree@gmail.com', subject: 'Mail Subject', text: 'mail text' });
    console.log(`Server is running on port ${port}`);
}
);
