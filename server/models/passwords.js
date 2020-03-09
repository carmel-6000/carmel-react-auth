'use strict'
const to = function (promise) { return promise.then(data => { return [null, data]; }).catch(err => [err]); };
const TimeCalcs = require('./../../../tools/server/lib/TimeCalcs.js');

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
            created: TimeCalcs.getTimezoneDatetime(Date.now())
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
        const now = TimeCalcs.getTimezoneDatetime(Date.now());
        //TODO Shira - get time from config
        const TIME_FOR_RESET_PASSWORD = 15552000000; //six months in milliseconds
        if (now - created >= TIME_FOR_RESET_PASSWORD) return true;

        return false;
    }

    //-----------------REMOTE METHODS DECLARATION BEGINS
    //-----------------REMOTE METHODS DECLARATION ENDS
};
