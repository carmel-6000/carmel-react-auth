
let request = require("request")

const verify = function (secretKey, req, cb) {
    console.log("req.bodyb", req.body)
    if (!req.body.captcha) return cb({ success: false });

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}`
    request(verifyUrl, (err, response, body) => {
        if (err) return cb({ success: false });
        body = JSON.parse(body)
        return cb(body);
    });
}

module.exports = verify;