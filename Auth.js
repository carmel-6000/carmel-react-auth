const Auth = {

  _isAuthenticated:false,
  
  isAuthenticated(){
    
    let at=localStorage.getItem('accessToken');
    //console.log("access token?",at);
    this._isAuthenticated= at!==null;
    return this._isAuthenticated;

  },

  

  jsonify(res){
    if (res && res.ok){
      return res.json();
    }else{
      console.log("Could not fetch data from server, make sure your server is running? (2)");
      return new Promise((resolve,reject)=>{
        reject([]);
      });
    }
  },

  authFetchJsonify(url, payload = null) {
    let _this=this;
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
  getUserId(){
    return eval(localStorage.getItem('avpr').replace(/\D/g,''));
  },

  authenticate(email,pw,cb){

    fetch('/api/CustomUsers/elogin/', {
      method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pw })
    })

    .catch(err=>{
      console.log("Server response err",err);
      return cb(false);
    })
    .then(response=>{return response.json()}).then(res=> {

        
        if (res.error){

          this._isAuthenticated = false;
          //localStorage.setItem('accessToken', '');
          //localStorage.setItem('com', '')
          return cb(false);

        } else {

          let string="qwertyuiopasdfghjklzxcvbnmASDGDFG".split('').sort(function(){return 0.5-Math.random()}).join('');
          this._isAuthenticated = true;
          localStorage.setItem('accessToken', res.id);
          localStorage.setItem('com', res.compArr);
          localStorage.setItem('avpr',string+res.userId+"jgfiogfgzfaazipof");
          return cb(true,res)
        }
        
    }); 
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
