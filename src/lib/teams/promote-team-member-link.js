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

    const {
      teamId,
      accountId,
      isAdmin,
      onPromote,
    } = this.props;

    this.setState({loading: true});

    try {
      await session.changeTeamAdminStatus(teamId, accountId, !isAdmin);
      await onPromote();
    } catch (err) {
      alert(`Failed to remove from team: ${err.message}`);
      this.setState({loading: false});
    }
  };

  render() {
    const {className, isAdmin, ownerAccountId, accountId} = this.props;
    const {loading} = this.state;

    // Cannot promote owner (always an admin)
    if (ownerAccountId === accountId) {
      return null;
    }

    const linkText = isAdmin ? '(revoke admin)' : '(promote to admin)';

    return (
      <Link to="#" onClick={this._handleClick.bind(this)} className={className}>
        {loading ? '(updating...)' : linkText}
      </Link>
    );
  }
}

PromoteTeamMemberLink.propTypes = {
  onPromote: PropTypes.func.isRequired,
  teamId: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  accountId: PropTypes.string.isRequired,
  ownerAccountId: PropTypes.string.isRequired,
};

export default PromoteTeamMemberLink;
