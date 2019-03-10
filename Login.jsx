import React, { Component } from 'react';
import './_Login.scss';
import Auth from './Auth';
import { Redirect } from 'react-router';
import ReactModal from 'react-responsive-modal';

class Login extends Component {

    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.state = {
            isLoading: false,
            redirTo: false,
            registerModal: false
        }

    }
    handleLogin(e) {
        e.preventDefault();

        let email = this.refs.email.value;
        let pw = this.refs.pw.value;
        this.setState({ isLoading: true });

        Auth.authenticate(email, pw, (isAuthenticated) => {

            this.setState({ isLoading: false });
            if (isAuthenticated === false) {
                alert("Login Failed, \n Try again");
                return;
            }
            if (isAuthenticated === true) {
                { this.props.navHeader() };
                this.setState({ redirTo: '/home' });
            }

        });

        return false;
    }

    openRegModal = () => {
        this.setState({ registerModal: !this.state.registerModal });
    }

    register = (e) => {
        e.preventDefault();
        let fd = new FormData(document.getElementById("registrationForm"));
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
                    alert("You are now a student in Creathush!")
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

    render() {
        console.log("this state", this.state)
        if (this.state.redirTo != false) {
            return (<Redirect to={{
                pathname: '/home', state: this.state
            }} />);

        } else
            return (
                <div className='loginPage'>

                    <div className='loginBox'>
                        <div className='frow'>
       
                        </div>
                        <form className="form" onSubmit={this.handleLogin}>
                        <p className="mt-1">ברוכים הבאים !</p>
                            <div className='form-group'>
                                <input className="form-control" type='email' ref='email' placeholder='מייל' required />
                            </div>
                            <div className='form-group'>
                                <input className="form-control" type='password' ref='pw' placeholder='סיסמא' required />
                            </div>
                            <div className='form-group'>
                                {this.state.isLoading ?
                                    <button className='btn btn-warning'>מתחבר...</button> :
                                    <input type='submit' className='btn btn-warning login_input' value='היכנס' />
                                }
                            </div>
                        </form>
                        <div className='frow'>
                            <p onClick={this.openRegModal}>לא רשומים? הירשמו עכשיו!</p>
                            <ReactModal closeOnOverlayClick shouldCloseOnEsc showCloseIcon open={this.state.registerModal} center onClose={this.openRegModal}>
                                <form className="form" id="registrationForm" style={{ textAlign: 'center' }} onSubmit={this.register}>
                                    <p className="mt-3">מלאו את הפרטים הבאים</p>
                                    <div className="form-group">
                                        <label for="registerPrivateName">הכנס שם פרטי</label>
                                        <input name='realm' id="registerPrivateName" className="form-control" type='text' placeholder="הכנס את שמך"></input>
                                    </div>
                                    <div className="form-group">
                                        <label for="registerEmail">הכנס כתובת מייל</label>
                                        <input name='email' id="registerEmail" className="form-control" type='email' required placeholder={"example@gmail.com"}></input>
                                    </div>
                                    <div className="form-group">
                                        <label for="registerUserName">הכנס שם משתמש</label>
                                        <input name='username' id="registerUserName" className="form-control" type='text' placeholder="הכנס שם משתמש"></input>
                                    </div>
                                    <div className="form-group">
                                        <label for="registerPasswd">הכנס סיסמא</label>
                                        <input required name='password' id="registerPasswd" className="form-control" type='password' placeholder="הכנס סיסמא"></input>
                                    </div>
                                    <button className='btn btn-warning' type='submit'>הירשם!</button>
                                </form>
                            </ReactModal>
                        </div>


                    </div>
                </div>
            )
    }

}

export default Login;
