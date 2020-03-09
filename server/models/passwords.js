'use strict'
const to = function (promise) { return promise.then(data => { return [null, data]; }).catch(err => [err]); };
var bcrypt;
try {
    // Try the native module first
    bcrypt = require('bcrypt');
    // Browserify returns an empty object
    if (bcrypt && typeof bcrypt.compare !== 'function') {
        bcrypt = require('bcryptjs');
    }
} catch (err) {
    // Fall back to pure JS impl
    bcrypt = require('bcryptjs');
}

module.exports = function (Passwords) {
    Passwords.upsertPwd = async function (owner, password) {
        let hashedPassword = Passwords.hashPassword(password)
        let [pwdFindErr, pwdFindRes] = await to(Passwords.find({
            where: { owner },
            fields: { id: true },
            order: 'id ASC'
        }));
        if (pwdFindErr) return { success: false };

        if (pwdFindRes[0] && pwdFindRes.length >= 3) {
            let [dPwdErr, dPwdRes] = await to(Passwords.destroyById(pwdFindRes[0].id))
            if (dPwdErr) return { success: false };
        }

        let [cPwdErr, cPwdRes] = await to(Passwords.create({
            password: hashedPassword,
            owner,
            created: getTimezoneDatetime(Date.now())
        }));
        if (cPwdErr || !cPwdRes) return { success: false };
        if (cPwdRes) return { success: true };
        return { success: false }; //needed??
    }

    Passwords.checkIfPasswordExists = async function (owner, password) {
        let [pwdFindErr, pwdFindRes] = await to(Passwords.find({
            where: { owner },
            fields: { id: true, password: true },
            order: 'id ASC'
        }));
        if (pwdFindErr || !pwdFindRes) return { exists: false };

        for (let pwd of pwdFindRes) {
            let [isMatchErr, isMatch] = await to(bcrypt.compare(password, pwd.password));
            if (isMatchErr) return { exists: false };
            else if (isMatch) return { exists: true };
        }
        return { exists: false };
    }


    Passwords.hashPassword = function (plain) {
        return Passwords.app.models.CustomUser.hashPassword(plain)
    };

    // accepts: userId (int)
    // return: resetRequired (boolean)
    Passwords.checkForResetPassword = async function (userId) {
        let [pwdFindErr, pwdFindRes] = await to(Passwords.find({
            where: { owner: userId },
            fields: { created: true },
            order: 'created DESC'
        }));
        if (pwdFindErr || !pwdFindRes) return false;

        const created = pwdFindRes[0] && pwdFindRes[0].created;
        if (!created) return false;
        const now = getTimezoneDatetime(Date.now());
        //TODO Shira - get time from config
        const TIME_FOR_RESET_PASSWORD = 15552000000; //six months in milliseconds
        if (now - created >= TIME_FOR_RESET_PASSWORD) return true;

        return false;
    }

    // Passwords.pwdDateValid = (password, owner, created, options, cb) => {
    //     let createDate = new Date(created);
    //     let intervalTime = 60 * 60 * 24 * 7 * 4 * 6 * 1000
    //     if ((Date.now() - createDate) >= intervalTime) {
    //         return cb(null, { success: false })
    //     }
    //     return cb(null, { success: true })
    // }

    //-----------------REMOTE METHODS DECLARATION BEGINS

    Passwords.remoteMethod('upsertPwd', {
        http: {
            path: '/upsertPwd',
            verb: 'post'
        },
        accepts: [
            { arg: 'owner', type: 'number' },
            { arg: 'password', type: 'string' },

            { arg: "options", type: "object", http: "optionsFromRequest" }
        ],
        returns: { arg: 'res', type: 'object', root: 'true' }
    });

    //-----------------REMOTE METHODS DECLARATION ENDS
};

// accepts: d - date
//          useOffset - if we want to use israel's timezone
// returns: datetime with format to post to database
function getTimezoneDatetime(d = Date.now(), useOffset = true) {
    // from this format -> 2/7/2020, 9:46:11
    // to this format   -> 2020-02-07T09:37:36.000Z
    if (!useOffset) { return new Date(d); }
    let now = new Date(d).toLocaleString("en-US", { timeZone: "Asia/Jerusalem", hour12: false });
    let nowArr = now.split(", ");
    let dateArr = nowArr[0].split("/");
    let month = dateArr[0].length === 2 ? dateArr[0] : "0" + dateArr[0];
    let day = dateArr[1].length === 2 ? dateArr[1] : "0" + dateArr[1];
    let date = dateArr[2] + "-" + month + "-" + day;
    let time = nowArr[1];
    let datetime = date + "T" + time + ".000Z";
    datetime = new Date(datetime);
    return datetime;
}