'use strict';
const verify = require('../lib/recaptcha')
require('dotenv').config()
const SECRET_KEY = process.env.REACT_APP_RECAPTCHA_SECRET_KEY;
const logUser = require('debug')('model:user');

module.exports = function RecaptchaHandler(Model) {

    Model.beforeRemote('*', function (ctx, modelInstance, next) {
        if (ctx.req.method !== "POST" && ctx.req.method !== "PUT" && ctx.req.method !== "PATCH"/* && !modelInstance.id*/)
            return next();
    
        verify(SECRET_KEY, ctx.req, (res) => {
            logUser("success??", res);
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
