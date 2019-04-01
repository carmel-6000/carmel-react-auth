const Auth = {

  _isAuthenticated:false,
  
  isAuthenticated(){
    
    let at=localStorage.getItem('accessToken');
    console.log("access token?",at);
    this._isAuthenticated= at!==null;
    return this._isAuthenticated;

  },
  authFetch(url, payload = null) {
    let accessToken = localStorage.getItem('accessToken');
    console.log("authFetch given accessToken:", accessToken);
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

  authenticate(email,pw,cb){

    fetch('/api/CustomUsers/elogin/', {
      method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pw })
    })

    .then(response=>{return response.json()}).then(res=> {

        console.log("res",res);
        if (res.error){

          this._isAuthenticated = false;
          localStorage.setItem('accessToken', '');
          localStorage.setItem('com', '')
          return cb(false);
        } else {

          this._isAuthenticated = true;
          localStorage.setItem('accessToken', res.id);
          localStorage.setItem('com', res.compArr)
          return cb(true)
        }
        
    }); 
  },
  logout(cb) {
    console.log("log out!")
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


    
    fetch('/api/Users', {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        method: "POST",
        body: JSON.stringify(payload)
    }).then((res => res.json()))
        .then(res => {
            if (!res.error) {
                console.log("User registered!!", res);
                alert(message)
                return false;
            }
            else {
                if (res.error.code)
                    alert(res.error.message)
                else if (res.error.details.codes.email[0] = "uniqueness")
                    alert("This email is alredy registered in our system.")

            }
        }).catch(error => {
            console.log("error!!", error);
            // alert()
        })

}


}

export default Auth;
