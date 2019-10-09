import React from 'react';
import {parse as urlParse} from 'url';
import PropTypes from 'prop-types';
import LeaveTeamLink from '../../lib/teams/leave-link';
import RemoveTeamAccountLink from '../../lib/teams/remove-account-link';
import UpdateTeamNameForm from '../../lib/teams/update-name-form';
import AddAccountToTeamForm from '../../lib/teams/add-account-form';
import App from '../../lib/app-wrapper';
import Link from '../../components/link';

class Teams extends React.Component {
  state = {
    error: '',
    activeTeam: null
  };

  componentDidMount () {
    this._checkUrl();
  }

  componentDidUpdate () {
    this._checkUrl();
  }

  _checkUrl () {
    const {teams} = this.props;
    const {activeTeam} = this.state;

    const {query} = urlParse(window.location.href, true);
    const teamId = query.id || null;
    const activeTeamId = activeTeam ? activeTeam.id : null;

    if (teamId === activeTeamId) {
      return;
    }

    if (!teamId) {
      this.setState({activeTeam: null});
      return;
    }

    const team = teams.find(t => t.id === teamId);

    // Team doesn't exist, so just redirect back
    if (!team) {
      window.location = '/app/teams';
      return;
    }

    this.setState({activeTeam: team});
  }

  renderEditTeam (activeTeam) {
    const {whoami, billingDetails} = this.props;

    let membersRemaining = 0;

    if (billingDetails && activeTeam) {
      membersRemaining = whoami.maxTeamMembers - activeTeam.accounts.length;
    } else if (whoami.isTrialing && activeTeam) {
      membersRemaining = 5 - activeTeam.accounts.length;
    }

    let inner = null;
    if (!whoami.isTrialing && !whoami.canManageTeams) {
      inner = (
        <div>
          <p>Manage who is on your team.</p>
          <p className="notice info">
            <strong>Upgrade to Teams</strong> to manage your own team
            <br/><br/>
            <Link to="/app/subscribe/#teams" className="button button--compact">
              Upgrade to Teams
            </Link>
          </p>
        </div>
      );
    } else if (activeTeam) {
      const {handleReload} = this.props;

      // Sort the accounts to put the user first. NOTE: We're making a copy since
      // sort modifies the original.
      const accounts = [...activeTeam.accounts].sort(a => a.id === whoami.accountId ? -1 : 1);

      inner = (
        <div>
          <UpdateTeamNameForm
            onUpdate={handleReload}
            teamId={activeTeam.id}
            teamName={activeTeam.name}
          />
          <AddAccountToTeamForm
            key={membersRemaining}
            onAdd={handleReload}
            teamId={activeTeam.id}
            membersRemaining={membersRemaining}
          />
          <div className="form-control">
            <label>Team Members
              <ul>
                {accounts.map(account => (
                  <li key={account.id}>
                    {account.firstName} {account.lastName}
                    {' '}
                    <small>({account.email})</small>
                    {' '}
                    {account.isAdmin ? (
                      <strong className="small pull-right">(admin)</strong>
                    ) : (
                      <React.Fragment>
                        <RemoveTeamAccountLink onRemove={this.props.handleReload}
                                               teamId={activeTeam.id}
                                               teamName={activeTeam.name}
                                               className="small pull-right"
                                               accountId={account.id}
                                               accountName={`${account.firstName} ${account.lastName}`.trim()}>
                          remove
                        </RemoveTeamAccountLink>
                      </React.Fragment>
                    )}
                  </li>
                ))}
              </ul>
            </label>
          </div>
        </div>
      );
    } else {
      // This should never happen...
      inner = (
        <p className="notice info">
          Uh oh! Your account does not have a default team. Please
          contact <strong>support@insomnia.rest</strong>
        </p>
      );
    }

    return (
      <div>
        <h2>{activeTeam.name}</h2>
        {inner}
      </div>
    );
  }

  renderTeamActionLink (team) {
    const {whoami} = this.props;

    const isAdmin = team.accounts.find(a => a.isAdmin && a.id === whoami.accountId);

    if (!isAdmin) {
      return (
        <LeaveTeamLink onLeave={this.props.handleReload}
                       teamId={team.id}
                       teamName={team.name}
                       className="small pull-right">
          leave
        </LeaveTeamLink>
      );
    }

    const {activeTeam} = this.state;
    const activeTeamId = activeTeam ? activeTeam.id : null;

    if (activeTeamId !== team.id) {
      return (
        <span className="small pull-right">
          <Link to={`/app/teams?id=${team.id}`}>(Manage Team)</Link>
        </span>
      );
    }

    return (
      <span className="small pull-right">(Editing)</span>
    );
  }

  renderTeams () {
    const {teams} = this.props;

    return (
      <div>
        <h2>Your Teams</h2>
        <p>
          These are the teams you are on.
        </p>
        {teams.length ? (
          <ul>
            {teams.map(team => (
              <li key={team.id}>
                {team.name}
                {' '}
                {this.renderTeamActionLink(team)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="info notice">
            You are not on any teams yet.
          </p>
        )}
      </div>
    );
  }

  render () {
    const {activeTeam} = this.state;
    return (
      <div>
        {activeTeam && (
          <React.Fragment>
            {this.renderEditTeam(activeTeam)}
            <hr/>
          </React.Fragment>
        )}
        {this.renderTeams()}
      </div>
    );
  }
}

Teams.propTypes = {
  handleReload: PropTypes.func.isRequired,
  whoami: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    canManageTeams: PropTypes.bool.isRequired,
    quantityOverride: PropTypes.number,
    maxTeamMembers: PropTypes.number.isRequired
  }).isRequired,
  teams: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    accounts: PropTypes.arrayOf(PropTypes.shape({
      isAdmin: PropTypes.bool.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired
    })).isRequired
  })).isRequired
};

export default (pageProps) => (
  <App title="Manage Teams" subTitle="Collaborate within Insomnia">
    {props => <Teams {...props} {...pageProps}/>}
  </App>
);
