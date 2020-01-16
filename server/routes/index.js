const logAuth = require('debug')('model:auth');

module.exports = function (app) {
    app.get('/', function (req, res, next) {
        logAuth("auth middleware for / is launched");
        let cookieVal = (req.accessToken && req.accessToken.id) ? req.accessToken.id : '';
        if (!cookieVal) {
            logAuth("AccessToken is not valid, deleting cookies...");
            let cookieKeys = ['access_token', 'kl', 'klo', 'klk', 'kloo', 'olk'];
            for (let key of cookieKeys) { res.clearCookie(key); }
        }
        
        next();
    });
}