const Auth = {

  _isAuthenticated:false,
  
  isAuthenticated(){
    
    let at=localStorage.getItem('accessToken');
    console.log("access token?",at);
    this._isAuthenticated= at!==null;
    return this._isAuthenticated;

  },
  getUserId() {
    return { userId: localStorage.getItem("userId"), userRole: localStorage.getItem("userRole") };
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

    fetch('/api/CustomUsers/login/', {
      method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pw })
    })

    .then(response=>{return response.json()}).then(res=> {

        console.log("res",res);
        if (res.error){

          this._isAuthenticated = false;
          localStorage.setItem('accessToken', '');
          localStorage.setItem('userId', '');
          localStorage.setItem('com', '')
          return cb(false);
        } else {

          this._isAuthenticated = true;
          localStorage.setItem('accessToken', res.id);
          localStorage.setItem('userId', res.userId);
          localStorage.setItem('com', res.compArr)
          return cb(true)
        }
        
    }); 
  },
  logout(cb) {
    console.log("log out!")
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('com')
    this._isAuthenticated = false;
    if (cb)
      cb();
    return;
  }

}

export default Auth;
