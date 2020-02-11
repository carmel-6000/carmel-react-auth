import React, { Component } from 'react';
import Recaptcha from 'react-google-invisible-recaptcha';

export default class MyRecaptcha extends Component {

    constructor(props) {
        super(props);
        this.recaptcha = React.createRef();
    }

    rOnLoaded = () => {
        this.recaptcha = this.recaptcha.current

        this.recaptcha && this.recaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, { action: 'homepage' })
            .then((token) => {
                sessionStorage.setItem('captcha', token);
                this.props.onResolved(token)
                this.recaptcha.reset()
            });

        this.captcha = sessionStorage.getItem("captcha")
        this.props.onResolved(this.captcha)
    }

    rOnExpired = () => {
        console.log("rOnExpired")
        this.recaptcha.reset();
    }

    rOnError = () => {
        console.log("rOnError")
        this.recaptcha.reset()
    }
    render() {
        return (
            <div>
                <Recaptcha
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                    action="homepage"
                    ref={this.recaptcha}//{e => this.recaptcha = e}
                    onLoaded={this.rOnLoaded}
                    locale={this.props.locale || "en"}
                    badge="bottomright"
                    onError={this.rOnError || null}
                    onExpired={this.rOnExpired || null}
                    onResolved={this.rOnResolved || null}
                // size="invisible"
                />
            </div>
        );
    }
}

