const api = require('./api');


const constructorMethods = app => {
    app.use('/api', api);

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Page not found" });
      });

};

module.exports = constructorMethods;