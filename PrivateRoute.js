import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import { Redirect } from 'react-router';
import Auth from './Auth';


class PrivateRoute extends Component {
  
  state = {haveAcces: false,loaded: false,}

  componentDidMount() {
    this.checkAcces();
  }

  checkAcces = () => {
    
    const { userRole, history } = this.props;
    let { haveAcces } = this.state;    
    Auth.isAuthenticatedSync((isAuth)=>{
        this.setState({haveAcces:isAuth,loaded: true,});
    });
  }

  render() {
    const { component: Component, ...rest } = this.props;
    const { loaded, haveAcces } = this.state;
    if (!loaded) return null;
    console.log("pathname",this.props.location.pathname);

    return (
      <Route key={0}
        {...rest}
        render={props => {
          console.log("have access?",haveAcces);
          return haveAcces ? 
          (<Component {...props} />) 
            : 
          (<Redirect to={{pathname: '/',}}/>);
        }}
      />
    );
    
  }
}
export default withRouter(PrivateRoute);

/*

return (
      <Route key={0}
        {...rest}
        render={props => {
          return haveAcces ? 
          (<Component {...props} />) 
            : 
          (<Redirect to={{pathname: '/',}}/>);
        }}
      />
    );
*/