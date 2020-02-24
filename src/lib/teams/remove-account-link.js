import React from 'react';
import PropTypes from 'prop-types';
import * as session from '../session';
import Link from '../../components/link';

class RemoveAccountLink extends React.Component {
  state = {
    loading: false
  };

  async _handleClick(e) {
    e.preventDefault();

    const {teamName, teamId, accountName, accountId, onRemove} = this.props;

    if (!confirm(`Are you sure you want to remove ${accountName} from ${teamName}?`)) {
      return;
    }

    this.setState({loading: true});

    try {
      await session.removeFromTeam(teamId, accountId);
      await onRemove();
    } catch (err) {
      alert(`Failed to remove from team: ${err.message}`);
      this.setState({loading: false});
    }
  };

  render() {
    const {children, className, ownerAccountId, accountId} = this.props;
    const {loading} = this.state;

    // Can't remove team owner from team
    if (accountId === ownerAccountId) {
      return null;
    }

    return (
      <Link to="#" onClick={this._handleClick.bind(this)} className={className}>
        {loading ? 'removing...' : children}
      </Link>
    );
  }
}

RemoveAccountLink.propTypes = {
  onRemove: PropTypes.func.isRequired,
  teamId: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  accountName: PropTypes.string.isRequired,
  accountId: PropTypes.string.isRequired,
  ownerAccountId: PropTypes.string.isRequired,
};

export default RemoveAccountLink;
