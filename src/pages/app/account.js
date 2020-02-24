import React from 'react';
import PropTypes from 'prop-types';
import CancelLink from '../../lib/common/cancel';
import SignOutLink from '../../lib/common/sign-out';
import App from '../../lib/app-wrapper';
import Link from '../../components/link';
import VerifyButton from '../../lib/common/reverify';

class Home extends React.Component {
  renderNotice() {
    const { billingDetails, whoami } = this.props;

    let notice = null;

    const trialEndDate = new Date(whoami.trialEnd);
    const trialEndMillis = trialEndDate.getTime() - Date.now();
    const trialDays = Math.ceil(trialEndMillis / 1000 / 60 / 60 / 24);
    const isTrialing = whoami.isTrialing;
    const isTrialOver = trialDays <= 0;
    const isPaymentRequired = whoami.isPaymentRequired;

    if (billingDetails && !billingDetails.isBillingAdmin) {
      return null;
    }

    if (billingDetails) {
      // Credit card entered but needs to pay
      if (billingDetails.isPaymentRequired) {
        notice = (
          <p className="notice info">
            <strong>Payment Required</strong>. Please subscribe to a plan to
            continue using Insomnia.
            <br />
            <br />
            <Link to="/app/subscribe/" className="button button--compact">
              Update Subscription
            </Link>
          </p>
        );
      } else if (
        billingDetails.subCancelled &&
        new Date(billingDetails.subPeriodEnd).getTime() > Date.now()
      ) {
        const dateString = new Date(billingDetails.subPeriodEnd).toDateString();
        notice = (
          <p className="notice info">
            Subscription <strong>canceled</strong> and will end{' '}
            <strong>{dateString}</strong>
            <br />
            <br />
            <Link to="/app/subscribe/" className="button button--compact">
              Resubscribe
            </Link>
          </p>
        );
      } else if (billingDetails.subCancelled) {
        notice = (
          <p className="notice info">
            Your subscription is <strong>canceled</strong>
            <br />
            <br />
            <Link to="/app/subscribe/" className="button button--compact">
              Resubscribe
            </Link>
          </p>
        );
      } else if (
        billingDetails.subTrialing &&
        new Date(billingDetails.subTrialEnd).getTime() > Date.now()
      ) {
        const trialEndDate = new Date(billingDetails.subTrialEnd);
        const trialEndMillis = trialEndDate.getTime() - Date.now();
        const trialDays = Math.ceil(trialEndMillis / 1000 / 60 / 60 / 24);
        notice = (
          <p className="notice info">
            You have <strong>{trialDays}</strong> day{trialDays === 1
            ? ''
            : 's'} on your trial
          </p>
        );
      }
    } else {
      if (isTrialing && !isTrialOver) {
        notice = (
          <p className="notice info">
            You still have <strong>{trialDays}</strong> day{trialDays === 1
            ? ''
            : 's'}{' '}
            left on your free trial
            <br />
            <br />
            <Link to="/app/subscribe/" className="button button--compact">
              Select a Plan
            </Link>
          </p>
        );
      } else if (isTrialOver && isPaymentRequired) {
        notice = (
          <p className="notice warn">
            Your trial has ended. Please subscribe to a plan to continue using
            your account.
            <br />
            <br />
            <Link to="/app/subscribe/" className="button button--compact">
              Update Subscription
            </Link>
          </p>
        );
      }
    }

    return (
      <div>
        {notice}
        <br />
      </div>
    );
  }

  renderLoginNotice() {
    if (this.props.whoami.appNumLaunches) {
      return null;
    }

    return <p className="notice info">You may now sign in to the app 💻</p>;
  }

  renderVerifyNotice() {
    if (this.props.whoami.isVerified) {
      return null;
    }

    return <p className="notice info">Please verify your account <VerifyButton /></p>;
  }

  render() {
    const { whoami, billingDetails } = this.props;
    const description = billingDetails && billingDetails.description;

    const periodEnd = billingDetails && new Date(billingDetails.subPeriodEnd).toDateString();

    let billingLink = null;
    if (!billingDetails) {
      billingLink = <Link to="/app/subscribe/">Choose Plan</Link>;
    }
    if (billingDetails && billingDetails.isBillingAdmin) {
      billingLink = <Link to="/app/subscribe/">Change Subscription</Link>;
    }

    return (
      <div>
        {this.renderLoginNotice()}
        {this.renderNotice()}
        {this.renderVerifyNotice()}
        <p className="bold text-lg">Hi {whoami.firstName},</p>
        <p>
          Your email address is <code>{whoami.email}</code>.
        </p>
        {description && billingDetails && billingDetails.isBillingAdmin ? (
          <p>
            You are subscribed to <strong>{description}</strong>!
          </p>
        ) : null}
        {description && billingDetails && !billingDetails.isBillingAdmin ? (
          <p>
            You are on a team that is subscribed to{' '}
            <strong>{description}</strong>!
          </p>
        ) : null}
        {billingDetails &&
        !billingDetails.subCancelled &&
        billingDetails.isBillingAdmin ? (
          <p>
            Your next invoice is scheduled for <strong>{periodEnd}</strong>
            {billingDetails.subPercentOff ? (
              <span className="success bold">
                {' '}
                (with {billingDetails.subPercentOff}% discount)
              </span>
            ) : null}
            .
          </p>
        ) : null}
        <p>Here are some things you might want to do.</p>
        <br/>
        <div className="d-flex d-flex-space-between">
          {billingLink && <button className="button">{billingLink}</button>}
          <button className="button">
            <Link to="/app/teams/">Manage Teams</Link>
          </button>
          <button className="button">
            <Link to="/app/change-password/">Change Password</Link>
          </button>
          <button className="button">
            <Link to="/app/update-account/">Account Details</Link>
          </button>
          <button className="button">
            <Link to="/app/invoices/">Invoice History</Link>
          </button>
          {billingDetails && billingDetails.isBillingAdmin ? (
            <button className="button">
              <CancelLink />
            </button>
          ) : null}
        </div>
        <hr />
        <div className="center">
          <SignOutLink />
          {' | '}
          <Link to="/app/delete-account/">Delete Account</Link>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  whoami: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    planName: PropTypes.string.isRequired,
    trialEnd: PropTypes.string.isRequired,
    isTrialing: PropTypes.bool.isRequired,
    isPaymentRequired: PropTypes.bool.isRequired,
    isVerified: PropTypes.bool.isRequired,
    isPremium: PropTypes.bool.isRequired,
    appNumLaunches: PropTypes.number.isRequired,
    canManageTeams: PropTypes.bool.isRequired,
  }).isRequired,
  billingDetails: PropTypes.shape({
    description: PropTypes.string.isRequired,
    isPaymentRequired: PropTypes.bool.isRequired,
    isBillingAdmin: PropTypes.bool.isRequired,
    subTrialing: PropTypes.bool.isRequired,
    subTrialEnd: PropTypes.string.isRequired,
    subCancelled: PropTypes.bool.isRequired,
    subPeriodEnd: PropTypes.string.isRequired,
    subPercentOff: PropTypes.number.isRequired,
  }),
};

export default () => (
  <App hideFooter title="Account" subTitle="Manage your Insomnia account">
    {props => <Home {...props} />}
  </App>
);
