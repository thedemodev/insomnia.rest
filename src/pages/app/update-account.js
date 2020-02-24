import React from 'react';
import PropTypes from 'prop-types';
import * as session from '../../lib/session';
import App from '../../lib/app-wrapper';

class ChangeAccountDetails extends React.Component {
  constructor(props) {
    super(props);

    const { whoami } = this.props;
    this.state = {
      loading: false,
      password: '',
      newEmail: whoami.email,
      newFirstName: whoami.firstName,
      newLastName: whoami.lastName,
      loginError: '',
      error: '',
    };
  }

  _handleUpdateInput(e) {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  }

  async _handleSubmit(e) {
    e.preventDefault();

    this.setState({ loading: true });
    const { whoami } = this.props;

    try {
      await session.login(whoami.email, this.state.password);
    } catch (err) {
      this.setState({ loginError: err.message, error: '', loading: false });
      return;
    }

    try {
      await session.changePasswordAndEmail(
        this.state.password,
        this.state.password,
        this.state.newEmail,
        this.state.newFirstName,
        this.state.newLastName,
      );
      window.location = '/app/account/';
    } catch (err) {
      console.error('Failed to update details', err.stack);
      this.setState({ error: err.message, loading: false });
    }
  };

  render() {
    const { error, loginError, loading, newEmail, newFirstName, newLastName } = this.state;
    console.log(this.state);
    return (
      <form onSubmit={this._handleSubmit.bind(this)}>
        <div className="form-row">
          <div className="form-control">
            <label>First Name
              <input type="text"
                     name="newFirstName"
                     defaultValue={newFirstName}
                     required
                     onChange={this._handleUpdateInput.bind(this)} />
            </label>
          </div>
          <div className="form-control">
            <label>Last Name
              <input type="text"
                     name="newLastName"
                     defaultValue={newLastName}
                     required
                     onChange={this._handleUpdateInput.bind(this)} />
            </label>
          </div>
        </div>
        <div className="form-control">
          <label>Email
            <input type="email"
                   name="newEmail"
                   defaultValue={newEmail}
                   required
                   onChange={this._handleUpdateInput.bind(this)}
                   placeholder="new@domain.com" />
          </label>
        </div>
        <hr className="hr--skinny"/>
        <div className="form-control">
          <label>Confirm Password {loginError ?
            <small className="error">({loginError})</small> : null}
            <input type="password"
                   name="password"
                   required
                   autoFocus
                   onChange={this._handleUpdateInput.bind(this)} />
          </label>
        </div>
        {error ? <div className="form-control error">** {error}</div> : null}
        <div className="form-control padding-top-sm right">
          {loading ?
            <button type="button" disabled className="button">Saving...</button> :
            <button type="submit" className="button">Save</button>
          }
        </div>
      </form>
    );
  }
}

ChangeAccountDetails.propTypes = {
  whoami: PropTypes.shape({
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
  }).isRequired,
};

export default () => (
  <App title="Update Account" subTitle="The details tied to your Insomnia account">
    {props => <ChangeAccountDetails {...props} />}
  </App>
);

