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

        // TODO Shira: do we need to re-save accesstoken in cookies after we validate it?
        // I don't think so....
        // if (cookieVal) {
        //     let cookieOptions = cookieVal ? { signed: true, maxAge: 1000 * 60 * 60 * 5 } : {};
        //     res.cookie("access_token", cookieVal, cookieOptions);
        // }
        
        next();
    });
}