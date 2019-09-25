// import AsyncTools from '../tools/AsyncTools';
// import GenericTools from '../tools/GenericTools'
let AsyncTools = {
  to(promise) {
    return promise.then(data => {
      return [null, data];
    })
      .catch(err => [err]);
  },
  parseJSON(response) {
    return new Promise((resolve, reject) =>
      response.json()
        .then((json) => resolve({
          status: response.status,
          ok: response.ok,
          json,
        }))
        .catch(error => { reject(error) })
    );
  },

  superFetch(url, payload) {

    let fPromise = payload === null ? fetch(url) : fetch(url, payload);

    return new Promise((resolve, reject) => {
      fPromise
        .then(this.parseJSON)// this trys to parse- get origin error when you have one.
        .then((response) => {
          if (response.ok) {
            return resolve([response.json, null]);
          }
          console.log("response", response.json)
          // extract the error from the server's json
          if (response.json.error && response.json.error.statusCode === 401)
            Auth.logout(() => window.location.href = window.location.origin); //FORCE LOGOUT.

          return resolve([null, response.json]);
        })
        .catch((error) => resolve([null, "No response, check your network connectivity"]));
    });
  }
}
const GenericTools = {
  getCookieByKey(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
  },
  deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;path='/';expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },
  deleteCookieByKey(name, path = '/', domain = null) {
    if (this.getCookieByKey(name)) {
      document.cookie = name + "=" +
        ((path) ? ";path=" + path : "") +
        ((domain) ? ";domain=" + domain : "") +
        ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  }
}

const Auth = {

  _isAuthenticated: false,

  getAccessToken() {
    return this.getItem("access_token");
  },
  isAuthenticated() {
    let at = this.getAccessToken();
    this._isAuthenticated = (at !== null && at !== undefined && at !== "");
    return this._isAuthenticated;
  },

  setItem(id, item, localStorageOnly = false, cookiesOnly = false) {
    if (!localStorageOnly)
      document.cookie = `${id}=${item}`;
    if (!cookiesOnly)
      localStorage.setItem(id, item);
  },

  getItem(id) {
    let cookie = GenericTools.getCookieByKey(id);
    if (cookie) return cookie;
    return localStorage.getItem(id);
  },

  removeItem(id) {
    localStorage.removeItem(id);
    GenericTools.deleteCookieByKey(id);
    console.log("deleted?", this.getItem(id))
  },

  jsonify(res) {
    if (res && res.ok) {
      return res.json();
    } else {
      console.log("Could not fetch data from server, make sure your server is running? (2)");
      return new Promise((resolve, reject) => {
        reject([]);
      });
    }
  },

  async superAuthFetch(url, payload = null) {
    let [res, err] = await AsyncTools.superFetch(url, payload);
    if (err && err.error && err.error.statusCode === 401) {
      Auth.logout(() => window.location.href = window.location.origin); //FORCE LOGOUT.      
    }
    return [res, err];
  },



  authFetchJsonify(url, payload = null) {
    let _this = this;

    return fetch(url, payload).then(_this.jsonify);

  },


  authFetch(url, payload = null) { //DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED
    return fetch(url, payload);
  },

  getRoutingCode() {
    return this.getItem("com");
  },

  getUserId() { //DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED
    return eval(localStorage.getItem('avpr').replace(/\D/g, ''));
  }, //DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED

  async authenticate(email, pw, cb) {
    const [res, err] = await AsyncTools.superFetch('/api/CustomUsers/elogin/', {
      method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pw })
    });

    if (err) {
      this._isAuthenticated = false;
      return cb({ success: false, msg: err });
    }
    //DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED
    let string = "qwertyuiopasdfghjklzxcvbnmASDGDFG".split('').sort(function () { return 0.5 - Math.random() }).join(''); //in the future- remove this
    localStorage.setItem('avpr', string + res.userId + "jgfiogfgzfaazipof");
    //DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED
    this._isAuthenticated = true;
    this.setItem('com', res.compArr);
    return cb({ success: true }, res);

  },
  logout(cb) {
    //~~~~~DEPRECATED~~~~~
    localStorage.removeItem('avpr');
    //~~~~END OF DEPRECATED~~~~~

    this.removeItem('access_token');
    this.removeItem('com');
    GenericTools.deleteAllCookies(); //needed?
    this._isAuthenticated = false;
    cb && cb();
    return;
  },
  register(fd, message) {
    var payload = {};
    fd.forEach(function (value, key) {
      payload[key] = value;
    });



    fetch('/api/CustomUsers', {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      method: "POST",
      body: JSON.stringify(payload)
    }).then((res => res.json()))
      .then(res => {
        if (!res.error) {
          // console.log("User registered!!", res);
          // console.log(message)
          return false;
        }
        else {
          if (res.error.code)
            console.log(res.error.message)
          else if (res.error.details.codes.email[0] = "uniqueness")
            console.log("This email is alredy registered in our system.")

        }
      }).catch(error => {
        // console.log("error!!", error);
      })

  },
  async registerAsync(fd, message) {
    var payload = {};
    fd.forEach(function (value, key) {
      payload[key] = value;
    });

    let res = await fetch('/api/CustomUsers', {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let [err, res2] = await AsyncTools.to(res.json());
      if (err) {
        return { error: err, ok: false };
      }
      return { error: res2.error.details ? Object.values(res2.error.details.messages) : Object.values(res2.error.code), ok: false };
    }

    return { ok: true };
  }


}

export default Auth;
