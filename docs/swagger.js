const swaggerAutogen = require('swagger-autogen')({
    openapi: '3.0.0'
});



const outputFile = './swagger-output.json';
const routes = ['../router/index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes);