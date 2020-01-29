import React from 'react';
import PropTypes from 'prop-types';
import * as session from '../../lib/session';
import App from '../../lib/app-wrapper';
import Link from '../../components/link';

const planTypeTeam = 'team';
const planTypePlus = 'plus';
const planCycleMonthly = 'monthly';
const planCycleYearly = 'yearly';
const minTeamSize = 2;
const pricePerMember = 8;

const planIdMap = {
  'plus-monthly-1': [planTypePlus, planCycleMonthly, 1],
  'plus-yearly-1': [planTypePlus, planCycleYearly, 1],
  'team-monthly-1': [planTypeTeam, planCycleMonthly, 5],
  'team-yearly-1': [planTypeTeam, planCycleYearly, 5]
};

class Subscribe extends React.Component {
  constructor (props) {
    super(props);

    const {billingDetails, whoami} = props;

    const quantity = Math.max(
      minTeamSize,
      billingDetails ? billingDetails.subQuantity : 5
    );

    let planDescription;
    if (window.location.hash === '#teams') {
      planDescription = planIdMap['team-monthly-1'];
    } else if (window.location.hash === '#plus') {
      planDescription = planIdMap['plus-monthly-1'];
    } else {
      planDescription = planIdMap[whoami.planId];
    }

    const fullName = `${whoami.firstName} ${whoami.lastName}`.trim();

    this.state = {
      loading: false,
      planType: planDescription ? planDescription[0] : planTypePlus,
      planCycle: planDescription ? planDescription[1] : planCycleMonthly,
      quantity: quantity || 5,
      useExistingBilling: billingDetails && billingDetails.hasCard,
      fullName: fullName,
      cardNumber: '',
      expireMonth: '01',
      expireYear: new Date().getFullYear() + 1,
      cvc: '',
      zip: '',
      error: '',
      memo: billingDetails ? billingDetails.subMemo : '',
    };
  }

  componentDidMount () {
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v2/';
    document.body.appendChild(s);
    s.addEventListener('load', () => {
      let key;
      if (window.location.hostname === 'staging.insomnia.rest') {
        key = 'pk_test_MbOhGu5jCPvr7Jt4VC6oySdH';
      } else if (window.location.hostname === 'localhost') {
        key = 'pk_test_MbOhGu5jCPvr7Jt4VC6oySdH';
      } else {
        key = 'pk_live_L8TkSkePPugJj7o73EclQFUI00JnQyPegW';
      }

      window.Stripe.setPublishableKey(key);
    });
  }

  _handleCardNumberChange (e) {
    // Using timeout or else target.value will not have been updated yet
    const value = e.target.value.trim();
    if (!value) {
      return;
    }

    const cardType = Stripe.card.cardType(value);
    const lastChar = value[e.target.value.length - 1];
    const num = value.replace(/[^0-9]*/g, '');
    let newNum = '';

    if (cardType.match(/american express/i)) {
      // 1111 222222 33333
      const g1 = num.slice(0, 4);
      const g2 = num.slice(4, 10);
      const g3 = num.slice(10, 15);

      newNum = g1;
      newNum += g2 ? ` ${g2}` : '';
      newNum += g3 ? ` ${g3}` : '';
    } else if (cardType.match(/diners club/i)) {
      // 1111 2222 3333 44
      const g1 = num.slice(0, 4);
      const g2 = num.slice(4, 8);
      const g3 = num.slice(8, 12);
      const g4 = num.slice(12, 14);

      newNum = g1;
      newNum += g2 ? ` ${g2}` : '';
      newNum += g3 ? ` ${g3}` : '';
      newNum += g4 ? ` ${g4}` : '';
    } else {
      // 1111 2222 3333 4444
      const g1 = num.slice(0, 4);
      const g2 = num.slice(4, 8);
      const g3 = num.slice(8, 12);
      const g4 = num.slice(12, 16);

      newNum = g1;
      newNum += g2 ? ` ${g2}` : '';
      newNum += g3 ? ` ${g3}` : '';
      newNum += g4 ? ` ${g4}` : '';
    }

    // Handle trailing dash so we can add and delete dashes properly
    if (lastChar === ' ') {
      newNum += ' ';
    }

    // this.setState({cardType: cardType === 'Unknown' ? '' : cardType});
    if (cardType.toLowerCase() !== 'unknown') {
      this.setState({cardType});
    } else {
      this.setState({cardType: ''});
    }

    // Only update number if it changed from the user's original to prevent cursor jump
    if (newNum !== value) {
      e.target.value = newNum;
    }

    if (Stripe.card.validateCardNumber(newNum)) {
      e.target.setCustomValidity('');
    } else {
      e.target.setCustomValidity('Invalid card number');
    }

    this._handleUpdateInput(e);
  }

  _handleUpdateInput (e) {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    this.setState({[e.target.name]: value, error: ''});
  }

  async _handleSubmit (e) {
    e.preventDefault();

    const {
      useExistingBilling,
      cardNumber,
      fullName,
      cvc,
      expireMonth,
      expireYear,
      zip,
      planType,
      planCycle,
      memo,
      quantity: quantityRaw,
    } = this.state;

    if (!useExistingBilling && !fullName.trim()) {
      this.setState({error: 'Card Error: No name provided'});
      return;
    }

    if (!useExistingBilling && !zip.trim()) {
      this.setState({error: 'Card Error: No zip/postal provided'});
      return;
    }

    if (!useExistingBilling && !cvc.trim()) {
      this.setState({error: 'Card Error: No cvc provided'});
      return;
    }

    this.setState({loading: true});

    const params = {
      cvc,
      name: fullName,
      number: cardNumber.replace(/ /g, ''),
      exp_month: parseInt(expireMonth, 10),
      exp_year: parseInt(expireYear, 10),
      address_zip: zip
    };

    const teamSize = Math.max(minTeamSize, quantityRaw);
    const quantity = planType === planTypePlus ? 1 : teamSize;
    const planId = `${planType}-${planCycle}-1`;

    const d = new Date();
    const subErrorKey = `subErrors_${d.getFullYear()}-${d.getMonth()}-${d.getDay()}`;
    const subErrors = parseInt(localStorage.getItem(subErrorKey) || '0');

    const finishBilling = async tokenId => {
      try {
        await session.subscribe(tokenId, planId, quantity, memo);
        window.location = '/app/account/';
      } catch (err) {
        this.setState({error: err.message, loading: false});
        localStorage.setItem(subErrorKey, subErrors + 1);
      }
    };

    if (useExistingBilling) {
      await finishBilling();
    } else if (subErrors > 10) {
      setTimeout(() => {
        this.setState({
          error: `Card Error: Your card was declined`,
          loading: false
        });
      }, 3000);
    } else {
      window.Stripe.card.createToken(params, async (status, response) => {
        if (status === 200) {
          await finishBilling(response.id);
        } else {
          const msg = response.error
            ? response.error.message
            : 'Unknown error (112)';
          this.setState({error: `Card Error: ${msg}`});
        }

        this.setState({loading: false});
      });
    }
  }

  static _calculatePrice (planType, planCycle, quantity) {
    quantity = Math.max(quantity, minTeamSize);
    const priceIndex = planCycle === planCycleMonthly ? 0 : 1;
    const price =
      planType === planTypePlus
        ? [5, 50]
        : [pricePerMember * quantity, pricePerMember * 10 * quantity];

    return price[priceIndex];
  }

  static _getPlanDescription (planType, planCycle, quantity) {
    const cycle = planCycle === planCycleMonthly ? 'month' : 'year';
    const price = Subscribe._calculatePrice(planType, planCycle, quantity);

    return `$${price} / ${cycle}`;
  }

  renderBillingNotice () {
    const {whoami, billingDetails} = this.props;

    const trialEndDate = new Date(whoami.trialEnd * 1000);
    const trialEndMillis = trialEndDate.getTime() - Date.now();
    const trialDays = Math.ceil(trialEndMillis / 1000 / 60 / 60 / 24);

    if (!billingDetails && trialDays > 0) {
      return (
        <p className="notice info">
          You still have <strong>{trialDays}</strong> day{trialDays === 1
          ? ''
          : 's'}{' '}
          left on your free trial
        </p>
      );
    }

    return null;
  }

  render () {
    const {
      loading,
      error,
      cardType,
      planType,
      planCycle,
      expireMonth,
      expireYear,
      quantity,
      useExistingBilling,
      fullName,
      memo,
    } = this.state;

    const {billingDetails} = this.props;

    if (billingDetails && !billingDetails.isBillingAdmin) {
      return this.renderBillingNotice();
    }

    let subscribeBtn = null;
    if (loading && billingDetails) {
      subscribeBtn = (
        <button type="button" disabled className="button">
          Updating...
        </button>
      );
    } else if (loading && !billingDetails) {
      subscribeBtn = (
        <button type="button" disabled className="button">
          Subscribing...
        </button>
      );
    } else if (!loading && billingDetails) {
      subscribeBtn = (
        <React.Fragment>
          <button type="submit" className="button">
            Change to {' '}
            {Subscribe._getPlanDescription(planType, planCycle, quantity)}
          </button>
          <p className="text-xs subtle">
            *Upgrades are billed immediately and downgrades will apply
            a credit on the next invoice
          </p>
        </React.Fragment>
      );
    } else if (!loading && !billingDetails) {
      subscribeBtn = (
        <button type="submit" className="button">
          Subscribe for{' '}
          {Subscribe._getPlanDescription(planType, planCycle, quantity)}
        </button>
      );
    }

    return (
      <form onSubmit={this._handleSubmit.bind(this)}>
        {this.renderBillingNotice()}
        <div className="form-control">
          <label>
            Plan Type
            <select
              className="wide"
              name="planType"
              defaultValue={planType}
              autoFocus
              onChange={this._handleUpdateInput.bind(this)}>
              <option value={planTypePlus}>Plus (Individual)</option>
              <option value={planTypeTeam}>Teams</option>
            </select>
          </label>
        </div>
        {planType === planTypeTeam ? (
          <div className="form-control">
            <label>
              Team Size{' '}
              {quantity < minTeamSize ? (
                <small>
                  &#40;billed for a minimum of {minTeamSize} members&#41;
                </small>
              ) : null}
              <input
                type="number"
                defaultValue={quantity}
                onChange={this._handleUpdateInput.bind(this)}
                min="1"
                max="500"
                title="Number of Team Members"
                name="quantity"
              />
            </label>
          </div>
        ) : null}
        <div className="form-row center">
          <div className="form-control">
            <label>
              <input
                type="radio"
                name="planCycle"
                checked={planCycle === planCycleMonthly}
                onChange={this._handleUpdateInput.bind(this)}
                value={planCycleMonthly}
              />
              {Subscribe._getPlanDescription(planType, planCycleMonthly, quantity)}
            </label>
          </div>
          <div className="form-control">
            <label>
              <input
                type="radio"
                name="planCycle"
                checked={planCycle === planCycleYearly}
                onChange={this._handleUpdateInput.bind(this)}
                value={planCycleYearly}
              />
              {Subscribe._getPlanDescription(planType, planCycleYearly, quantity)}
            </label>
          </div>
        </div>
        <hr className="hr--skinny"/>
        {billingDetails && billingDetails.hasCard ? (
          <div className="form-control">
            <label>
              <input
                type="checkbox"
                name="useExistingBilling"
                onChange={this._handleUpdateInput.bind(this)}
                defaultChecked={useExistingBilling}
              />
              Use card ending in <code>{billingDetails.lastFour}</code>
            </label>
          </div>
        ) : null}

        {useExistingBilling ? (
          <div/>
        ) : (
          <div>
            <div className="form-control">
              <label>
                Full Name
                <input
                  type="text"
                  name="fullName"
                  placeholder="Maria Garcia"
                  defaultValue={fullName}
                  onChange={this._handleUpdateInput.bind(this)}
                  required
                />
              </label>
            </div>
            <div className="form-control">
              <label>
                Card Number {cardType ? `(${cardType})` : null}
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="XXXX XXXX XXXX XXXX"
                  onChange={this._handleCardNumberChange.bind(this)}
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <div className="form-control">
                <label>Expiration Date</label>
                <br/>
                <select
                  name="expireMonth"
                  title="expire month"
                  defaultValue={expireMonth}
                  onChange={this._handleUpdateInput.bind(this)}>
                  <option value="--">-- Month --</option>
                  <option value="01">01 – January</option>
                  <option value="02">02 – February</option>
                  <option value="03">03 – March</option>
                  <option value="04">04 – April</option>
                  <option value="05">05 – May</option>
                  <option value="06">06 – June</option>
                  <option value="07">07 – July</option>
                  <option value="08">08 – August</option>
                  <option value="09">09 – September</option>
                  <option value="10">10 – October</option>
                  <option value="11">11 – November</option>
                  <option value="12">12 – December</option>
                </select>{' '}
                <select
                  name="expireYear"
                  title="expire year"
                  defaultValue={expireYear}
                  onChange={this._handleUpdateInput.bind(this)}>
                  <option value="--">-- Year --</option>
                  <option value="2016">2016</option>
                  <option value="2017">2017</option>
                  <option value="2018">2018</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                  <option value="2031">2031</option>
                  <option value="2032">2032</option>
                  <option value="2033">2033</option>
                  <option value="2034">2034</option>
                  <option value="2035">2035</option>
                  <option value="2036">2036</option>
                  <option value="2037">2037</option>
                  <option value="2038">2038</option>
                  <option value="2039">2039</option>
                </select>
              </div>
              <div className="form-control">
                <label>
                  Security Code (CVC)
                  <input
                    type="text"
                    name="cvc"
                    onChange={this._handleUpdateInput.bind(this)}
                    required
                  />
                </label>
              </div>
            </div>

            <div className="form-control">
              <label>
                Zip/Postal Code
                <input
                  required
                  type="text"
                  name="zip"
                  onChange={this._handleUpdateInput.bind(this)}
                />
              </label>
            </div>
          </div>
        )}

        <hr className="hr--skinny"/>
        <div className="form-control">
          <label>
            Additional Information for invoice (Address, VAT, etc)
            <textarea
              rows="3"
              value={memo}
              name="memo"
              onChange={this._handleUpdateInput.bind(this)}
            />
          </label>
        </div>

        {error ? (
          <small className="form-control error">** {error}</small>
        ) : null}

        <div className="form-control right padding-top-sm">
          {subscribeBtn}
        </div>

        <hr className="hr--skinny"/>
        <p className="small subtle center">
          Payments secured by{' '}
          <Link to="https://stripe.com" target="_blank">
            Stripe
          </Link>
        </p>
      </form>
    );
  }
}

Subscribe.propTypes = {
  whoami: PropTypes.shape({
    planId: PropTypes.string.isRequired
  }).isRequired,
  billingDetails: PropTypes.shape({
    subQuantity: PropTypes.number.isRequired,
    subMemo: PropTypes.string.isRequired,
    hasCard: PropTypes.bool.isRequired,
    lastFour: PropTypes.string.isRequired,
    isBillingAdmin: PropTypes.bool.isRequired,
  }),
};

export default () => (
  <App
    title="Subscribe to Plan"
    subTitle="Visa, MasterCard, or American Express">
    {props => <Subscribe {...props} />}
  </App>
);
