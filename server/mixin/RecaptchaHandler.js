'use strict';
const verify = require('../../server/lib/recaptcha')
require('dotenv').config()
const SECRET_KEY = process.env.REACT_APP_RECAPTCHA_SECRET_KEY;

module.exports = function RecaptchaHandler(Model) {

    Model.beforeRemote('*', function (ctx, modelInstance, next) {
        verify(SECRET_KEY, ctx.req, (res) => {
            console.log("success??", res);
            if (!res.success || res.score < 0.5) {
                return next({
                    details: { messages: res["error-codes"] },
                    code: "RECAPTCHA_ERROR",
                    msg: { error: { code: "RECAPTCHA_ERROR" } }
                });
            }
            return next();
        });
    });
}
