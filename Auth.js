import AsyncTools from '../tools/AsyncTools';

const Auth = {

  _isAuthenticated: false,

  isAuthenticated() {

    let at = localStorage.getItem('accessToken');
    //console.log("access token?",at);
    this._isAuthenticated = at !== null;
    return this._isAuthenticated;

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

  superAuthFetch(url,payload=null){

    let accessToken = localStorage.getItem('accessToken');
   
    if (accessToken === null) {
      return url;
    }

    if (url.includes("?")) {
        url += "&access_token=" + accessToken;
    } else {
        url += "?access_token=" + accessToken;
    }

    return AsyncTools.superFetch(url,payload);

  },

  

  authFetchJsonify(url, payload = null) {
    let _this = this;
    let accessToken = localStorage.getItem('accessToken');

    if (accessToken === null) {
      return fetch(url, payload).then(_this.jsonify);
    }

    if (url.includes("?")) {
      url += "&access_token=" + accessToken;
    } else {
      url += "?access_token=" + accessToken;
    }

    if (payload) return fetch(url, payload).then(_this.jsonify);

    return fetch(url).then(_this.jsonify);

  },


  authFetch(url, payload = null) {
    let accessToken = localStorage.getItem('accessToken');
    //console.log("authFetch given accessToken:", accessToken);
    if (accessToken === null) {
      return url;
    } else {

      if (url.includes("?")) {
        url += "&access_token=" + accessToken;
      } else {
        url += "?access_token=" + accessToken;
      }
      if (payload)
        return fetch(url, payload);
      else return fetch(url);
    }
  },
  
  getRoutingCode() {
    return localStorage.getItem('com');
  },

  afterAuthenticate(promise, cb) {
    promise.catch(err => {
      console.log("Server response err", err);
      return cb(false);
    })
      .then(response => { return response.json() }).then(res => {
        return this.afterResponseAuth(res, cb);
      });
  },

  afterResponseAuth(res, cb){
    if (res.error) {
      this._isAuthenticated = false;
      //localStorage.setItem('accessToken', '');
      //localStorage.setItem('com', '')
      return cb({ success: false, msg: res.error });
    }

    let string = "qwertyuiopasdfghjklzxcvbnmASDGDFG".split('').sort(function () { return 0.5 - Math.random() }).join('');
    this._isAuthenticated = true;
    localStorage.setItem('accessToken', res.id);
    localStorage.setItem('com', res.compArr);
    localStorage.setItem('avpr', string + res.userId + "jgfiogfgzfaazipof");
    return cb({ success: true }, res);
  },

  authenticate(email, pw, cb) {
    const promise = fetch('/api/CustomUsers/elogin/', {
      method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pw })
    });
    return this.afterAuthenticate(promise, cb);


  },
  logout(cb) {
    //console.log("log out!")
    localStorage.removeItem('accessToken');
    localStorage.removeItem('com')
    this._isAuthenticated = false;
    if (cb)
      cb();
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
          console.log("User registered!!", res);
          console.log(message)
          return false;
        }
        else {
          if (res.error.code)
            console.log(res.error.message)
          else if (res.error.details.codes.email[0] = "uniqueness")
            console.log("This email is alredy registered in our system.")

        }
      }).catch(error => {
        console.log("error!!", error);
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
