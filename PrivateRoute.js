import React, { Component } from 'react';//, Suspense, lazy
import { Route, Link, withRouter } from "react-router-dom";
import { Redirect } from 'react-router';
import Auth from './Auth';
import b from 'base-64';



class _PrivateRouteAsync extends Component {

  state = { haveAccess: false, loaded: false, }

  componentDidMount() {
    this.checkAcces();
  }

  checkAcces = () => {

    const { userRole, history } = this.props;
    let { haveAccess } = this.state;
    Auth.isAuthenticatedSync((isAuth) => {
      this.setState({ haveAccess: isAuth, loaded: true });
    });

  }

  render() {
    const { component: Component, ...rest } = this.props;
    const { loaded, haveAccess } = this.state;
    if (!loaded) return null;
    // console.log("pathname", this.props.location.pathname);


    return (
      <Route key={0}
        {...rest}
        render={props => {
          // console.log("have access?", haveAccess);
          return haveAccess ?
            (<Component {...props} />)
            :
            (<Redirect to={{ pathname: '/', }} />);
        }}
      />
    );

  }
}

const PrivateRouteAsync = withRouter(_PrivateRouteAsync);

//PrivateRoute purpose
//This component aims to provide a distinct separation between two access modes:
//(1) No access: either there's no authentication (anonymous user), or either there's no access according to roles-access.config.json
//In that case (no access), we will NOT expose any route at all to the user for the sake of security, 
//we will render a <div /> which stands for NULL.
//(2) Access permitted: The desired component will be rendered into the route.
//Please do not change any of this functionality without consulting Eran
class PrivateRoute extends Component {

  constructor(props) {
    super(props);
    
    let kls = Auth.getKls();
    this.klsk = [];
    this.dhp = null;
    //console.log("KLS?",kls);
    //console.log("klo?",JSON.parse(b.decode(kls.klo)));
    try {
      let klsk = JSON.parse(b.decode(kls.klo));
      this.klsk = klsk.a;
      this.dhp = klsk.b;

    } catch (err) {
      // console.log("ERROR", err)
      // Auth.logout()
    }
    this.haveAccess = Auth.isAuthenticated();
  }

  render() {
    const { compName, component: Component, ...rest } = this.props;
    
    if (this.klsk.indexOf(compName) == -1 || !this.haveAccess) {
      console.log("compName(%s) is excluded", compName);
      return <div />;
    }
    console.log("ARE we here?!");
    return (<Route key={0} {...rest} render={props => {
        return <Component {...props} />;
    }} />);
  }
}
//const PrivateRoute = withRouter(_PrivateRoute);
//const PrivateRoute=_PrivateRoute;

class _MultipleRoute extends Component {
  constructor(props) {
    super(props);
    let kls = Auth.getKls();
    this.dhp = null;
    try {
      let klsk = JSON.parse(b.decode(kls.klo));
      this.klsk = klsk.a;

    } catch (err) { }

    this.haveAccess = Auth.isAuthenticated();
  }
  render() {
    const { comps, component: Component, ...rest } = this.props;
    let k = Object.keys(comps);
    if (!this.klsk) return <div></div>;
    const intersection = this.klsk.filter(element => k.includes(element));
    if (!intersection.length) {
      return <Link to="/">Go back to login</Link>;
    }
    return (
      <Route exact key={0} {...rest} render={props => {
        let hasc = comps[intersection[0]] && this.haveAccess;
        let Co = <div />;
        if (hasc) { Co = comps[intersection[0]] }
        return this.haveAccess ? (<Co {...props} />) : <Link to="/">Go back to login 1</Link>;
        ;
      }}
      />
    );
  }
}
const MultipleRoute = withRouter(_MultipleRoute);


class _HomeRoute extends Component {
  constructor(props) {
    super(props);
    let kls = Auth.getKls();
    this.dhp = null;
    try {
      let klsk = JSON.parse(b.decode(kls.klo));
      this.dhp = klsk.b;
    } catch (err) { }

    this.haveAccess = Auth.isAuthenticated();
  }
  render() {
    const { comps, component: Component, ...rest } = this.props;
    return (
      <Route exact key={0} {...rest} render={props => {
        let hasDhp = this.dhp !== null && comps[this.dhp] && this.haveAccess;
        let Dhp = <div />;
        if (hasDhp) { Dhp = comps[this.dhp]; }
        return hasDhp ? (<Dhp {...props} />) : (<Component {...props} />);
      }}
      />
    );

  }
}
const HomeRoute = withRouter(_HomeRoute);

// PublicPrivateRoute purpose
// It separates between two access modes and user types:
// (1) Anonymous users:
//     The desired component will be rendered into the route.
// (2) Logged-in users: 
//     Authenticated users cannot access a public route unless it's specified in roles-access.config
// Use case scenario: 
// If a page should be restricted to authenticated users but enabled to anonymous users we should use PublicPrivateRoute
// Whereas inside roles-access.config the user's role access is specified.
// Example:
// login or registration pages should be PUBLIC for anonymous users but DISABLED for logged-in users!
const PublicPrivateRoute = ({ component: Component, ...rest }) => {
  if (Auth.isAuthenticated()) return <PrivateRoute component={Component} {...rest} />
  return <Route {...rest} render={(props) => ( <Component {...props} /> )} />
}

export { PrivateRoute, PrivateRouteAsync, HomeRoute, MultipleRoute, PublicPrivateRoute };
