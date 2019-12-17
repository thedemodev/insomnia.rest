import React from 'react';
import PropTypes from 'prop-types';
import * as session from '../session';
import Link from '../../components/link';

class PromoteTeamMemberLink extends React.Component {
  state = {
    loading: false
  };

  async _handleClick(e) {
    e.preventDefault();

    const {teamId, accountId, onRemove} = this.props;

    this.setState({loading: true});

    try {
      await session.promoteTeamAdmin(teamId, accountId, true);
      await onRemove();
    } catch (err) {
      alert(`Failed to remove from team: ${err.message}`);
      this.setState({loading: false});
    }
  };

  render() {
    const {className, accountIsAdmin} = this.props;
    const {loading} = this.state;
    const linkText = accountIsAdmin ? 'revoke admin' : 'assign admin';
    return (
      <Link to="#" onClick={this._handleClick.bind(this)} className={className}>
        {loading ? 'updating...' : 'make admin'}
      </Link>
    );
  }
}

PromoteTeamMemberLink.propTypes = {
  onPromote: PropTypes.func.isRequired,
  teamId: PropTypes.string.isRequired,
  accountIsAdmin: PropTypes.bool.isRequired,
  accountId: PropTypes.string.isRequired,
};

export default PromoteTeamMemberLink;
