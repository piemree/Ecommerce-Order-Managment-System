require("dotenv").config()
const express = require('express');
const errorHandler = require("./middlewares/errorHandler.middleware");
const app = express();
const port = 3000;

app.use(express.json());

app.use('/api', require('./router'));
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}
);
