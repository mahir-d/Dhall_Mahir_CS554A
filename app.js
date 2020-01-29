const express = require('express');
const app = express();
const configRoutes = require("./routes");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
configRoutes(app);

app.listen(3000, () => {
    console.log('server started');
    console.log("Routes will be running on http://localhost:3000");
  
});