import AsyncTools from '../tools/AsyncTools';
import GenericTools from '../tools/GenericTools'
import Authentication from './Authentication';

const Auth = {

  _isAuthenticated: false,

  getKls(){
    let kls={kl:this.getItem('kl'),klo:this.getItem('klo')};    
    //console.log("KLS? (auth.js)",kls);
    return kls;
  },
  getAccessToken() {
    return this.getItem("access_token");
  },
  isAuthenticated() {
    let at = this.getAccessToken();
    this._isAuthenticated = (at !== null && at !== undefined && at !== "");
    return this._isAuthenticated;
  },

  //Since we are now using cookies, there is no need to use this method anymore
  isAuthenticatedSync(cb) {    
    let authentication=Authentication.getInstance();
    authentication.isAuthenticatedSync(cb);
  },

  setItem(id, item, localStorageOnly = false, cookiesOnly = false) {
    if (!localStorageOnly)
      document.cookie = `${id}=${item}`;
    if (!cookiesOnly)
      localStorage.setItem(id, item);
  },

  getItem(id) {
    let cookie = GenericTools.getCookieByKey(id);
    //console.log("COOKIE by id (%s)",id,cookie);
    if (cookie) return cookie;
    return localStorage.getItem(id);
  },

  removeItem(id) {
    localStorage.removeItem(id);
    GenericTools.deleteCookieByKey(id);
    // console.log("deleted?", this.getItem(id))
  },

  jsonify(res) {
    if (res && res.ok) {
      return res.json();
    } else {
      //console.log("Could not fetch data from server, make sure your server is running? (2)");
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

  
  async login(email, pw, cb) {
    return this.authenticate(email,pw,cb);
  },

  async authenticate(email, pw, cb) {
    const [res, err] = await AsyncTools.superFetch('/api/CustomUsers/elogin/', {
      method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pw })
    });

    if (err) {
      this._isAuthenticated = false;
      return new Promise((res,rej)=>{res({success:false,msg:err})});
    }
    
    console.log("Login res",res);
    this._isAuthenticated = true;

    
    this.setItem('klo',res.klo,false,true);
    this.setItem('kl',res.kl,false,true);

    return new Promise((res,rej)=>{res({success:true})});
    //return cb({ success: true }, res);

  },

  logout(cb) {
    
    this.removeItem('access_token');
    this.removeItem('kl');
    this.removeItem('klo');
    this.removeItem('klk');
    this.removeItem('kloo');
    this.removeItem('olk');

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
  },

  inactivityTime(cb) {
    let time;

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(()=>Auth.logout(cb), 10 * 60 * 1000) //10 mins
    }

    window.onload = resetTimer();
    // DOM Events - addeventlisteners
    document.addEventListener("load", resetTimer);
    document.addEventListener("mousemove", resetTimer);
    document.addEventListener("mousedown", resetTimer); // touchscreen presses
    document.addEventListener("touchstart", resetTimer);
    document.addEventListener("click", resetTimer);     // touchpad clicks
    document.addEventListener("scroll", resetTimer);    // scrolling with arrow keys
    document.addEventListener("keypress", resetTimer);
    document.addEventListener("mousewheel", resetTimer);
    document.addEventListener("DOMMouseScroll", resetTimer);
    document.addEventListener("keypress", resetTimer);
  },

  //DEPRECATED
  authFetchJsonify(url, payload = null) {return this.superAuthFetch(url,payload);},
  //DEPRECATED
  authFetch(url, payload = null){return this.superAuthFetch(url,payload);},
  //DEPRECATED 
  getUserId() { return 0;}, 

}

export default Auth;