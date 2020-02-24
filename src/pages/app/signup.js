import React from 'react';
import * as session from '../../lib/session';
import App from '../../lib/app-wrapper';
import Link from '../../components/link';

class SignUp extends React.Component {
  state = {
    step: 1,
    agreeToTerms: false,
    agreeToEmails: true,
    loading: false,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    error: '',
  };

  _handleUpdateInput(e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    this.setState({[e.target.name]: value, error: ''});
  }

  _handleUpdatePasswordConfirm(e) {
    this._handleUpdateInput(e);

    if (this.state.password !== e.target.value) {
      e.target.setCustomValidity('Passwords did not match');
    } else {
      e.target.setCustomValidity('');
    }
  }

  _handleBack(e) {
    e.preventDefault();
    this.setState({step: this.state.step - 1});
  }

  async _handleSubmit(e) {
    e.preventDefault();

    if (this.state.step < 2) {
      this.setState({step: this.state.step + 1});
      return;
    }

    if (!this.state.agreeToTerms) {
      alert('Please verify that you agree to the terms of service');
      return;
    }

    this.setState({loading: true});

    try {
      await session.signupAndLogin(
        this.state.firstName,
        this.state.lastName,
        this.state.email,
        this.state.password,
        this.state.agreeToEmails,
      );

      const nextUrl = localStorage.getItem('login.next') || '/app/account/';
      localStorage.removeItem('login.next');

      window.location = nextUrl;
    } catch (err) {
      console.error('Failed to sign up', err);
      this.setState({error: err.message, loading: false});
    }
  };

  renderStep1() {
    const {error, loading} = this.state;
    return (
      <div key="step-1">
        <div className="form-row">
          <div className="form-control">
            <label>First Name *
              <input type="text"
                     name="firstName"
                     placeholder="Maria"
                     defaultValue={this.state.firstName}
                     onChange={this._handleUpdateInput.bind(this)}
                     autoFocus
                     required/>
            </label>
          </div>
          <div className="form-control">
            <label>Last Name
              <input type="text"
                     name="lastName"
                     placeholder="Garcia"
                     defaultValue={this.state.lastName}
                     onChange={this._handleUpdateInput.bind(this)}/>
            </label>
          </div>
        </div>
        <div className="form-control">
          <label>Email Address *
            <input type="email"
                   name="email"
                   placeholder="name@domain.com"
                   defaultValue={this.state.email}
                   onChange={this._handleUpdateInput.bind(this)}
                   required/>
          </label>
        </div>
        <div className="form-control">
          <label>Password * <span className="subtle">(minimum 8 characters)</span>
            <input type="password"
                   name="password"
                   onChange={this._handleUpdateInput.bind(this)}
                   defaultValue={this.state.password}
                   placeholder="•••••••••••••"
                   pattern=".{8,}"
                   required/>
          </label>
        </div>
        {error ? <div className="form-control error">** {error}</div> : null}
        <div className="form-row padding-top-sm">
          <div className="form-control">
            or, <Link to="/app/login/">Log In</Link>
          </div>
          <div className="form-control right">
            {loading ?
              <button type="button" disabled className="button">Proceeding...</button> :
              <button type="submit" className="button">Proceed to Next Step</button>
            }
          </div>
        </div>
      </div>
    );
  }

  renderStep2() {
    const {error, loading, agreeToTerms, agreeToEmails} = this.state;
    return (
      <div key="step-2">
        <div className="form-control">
          <p className="notice warn small">
            <strong>Keep your password safe because it cannot be recovered.</strong>
            <br/>
            <Link to="https://insomnia.rest/documentation/plus/">Read More</Link> about
            how your password is used to encrypt your data.
          </p>
        </div>
        <div className="form-control">
          <label>Confirm Password
            <input type="password"
                   name="passwordConfirm"
                   placeholder="•••••••••••••"
                   defaultValue={this.state.passwordConfirm}
                   onChange={this._handleUpdatePasswordConfirm.bind(this)}
                   autoFocus/>
          </label>
        </div>
        <div className="form-control right">
          <label>
            <input type="checkbox"
                   name="agreeToTerms"
                   required
                   defaultChecked={agreeToTerms}
                   onChange={this._handleUpdateInput.bind(this)}/>
            I agree to the
            {' '}
            <Link to="https://insomnia.rest/terms/" target="_blank">Terms of Service</Link>
          </label>
        </div>
        <div className="form-control right">
          <label>
            <input type="checkbox"
                   name="agreeToRemember"
                   required
                   defaultChecked={agreeToTerms}
                   onChange={this._handleUpdateInput.bind(this)}/>
                   I have backed-up my password
          </label>
        </div>
        {error ? <small className="form-control error">** {error}</small> : null}
        <div className="form-row padding-top-sm">
          <div className="form-control">
            <Link to="#" onClick={this._handleBack.bind(this)}>&lt; Back</Link>
          </div>
          <div className="form-control right">
            {loading ?
              <button type="button" disabled className="button">Creating Account...</button> :
              <button type="submit" className="button">Create Account</button>
            }
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {step} = this.state;

    let inner;
    if (step === 1) {
      inner = this.renderStep1();
    } else if (step === 2) {
      inner = this.renderStep2();
    }

    return (
      <form onSubmit={this._handleSubmit.bind(this)} method="POST">
        {inner}
        <hr/>
        <div className="center">
          <Link to="/terms/">Terms of Service</Link>
        </div>
      </form>
    );
  }
}

SignUp.propTypes = {};

export default () => (
  <App noAuth title="Sign Up" subTitle="Access data sync and other features 🌥">
    {props => <SignUp {...props}/>}
  </App>
);

