require("dotenv").config()
const express = require('express');
const errorHandler = require("./middlewares/errorHandler.middleware");
const settingsService = require("./services/settings.service");
const settings = require("./settings");
const app = express();
const port = 3000;

app.use(express.json());

app.use('/api', require('./router'));
app.use(errorHandler);

app.listen(port, async () => {
    await settingsService.createSetting(settings);
    console.log(`Server is running on port ${port}`);
}
);
