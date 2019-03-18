import React from "react";
import { Redirect } from 'react-router';

const Auth={

  _isAuthenticated:false,
  
  isAuthenticated(){
    
    let at=localStorage.getItem('accessToken');
    console.log("access token?",at);
    this._isAuthenticated= at!==null;
    return this._isAuthenticated;

  },
  authFetch(url, metaDate = {}) {
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
      return fetch(url, metaDate);
    }
  },

  authenticate(email,pw,cb){

    fetch('/api/Users/login', {method: 'POST',headers: {'Accept': 'application/json','Content-Type': 'application/json'},
        body: JSON.stringify({email: email, password: pw})
    })

    .then(response=>{return response.json()}).then(res=> {

        console.log("res",res);
        if (res.error){

            this._isAuthenticated=false;
            localStorage.setItem('accessToken','');
            return cb(false);
        }else{

            this._isAuthenticated=true;    
            localStorage.setItem('accessToken',res.id);
            return cb(true)
        }
        
    }); 
  },
  logout(cb){

    localStorage.removeItem('accessToken','');
    this._isAuthenticated=false;
    return;
  }

}

export default Auth;