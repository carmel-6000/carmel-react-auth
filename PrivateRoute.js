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


class _PrivateRoute extends Component {

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
    if (this.klsk.indexOf(compName) == -1) {
      console.log("compName(%s) is excluded", compName);
      return <div></div>;
    }
    return (<Route key={0} {...rest} render={props => {
      return this.haveAccess ?
        (<Component {...props} />) : <Link to="/">Go back to login2</Link>;
    }}
    />
    );
  }
}
const PrivateRoute = withRouter(_PrivateRoute);

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
      return (<Link to="/">Go back to login</Link>);
    }
    return (
      <Route exact key={0} {...rest} render={props => {
        let hasc = comps[intersection[0]] && this.haveAccess;
        let Co = <div />;
        if (hasc) { Co = comps[intersection[0]] }
        return this.haveAccess ? (<Co {...props} />) : (<Link to="/">Go back to login 1</Link>);
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

export { PrivateRoute, PrivateRouteAsync, HomeRoute, MultipleRoute };