const React = require('react');
const { AccountStore, Actions } = require('mailspring-exports');

class AccountSwitcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: AccountStore.accounts()
    };
  }

  componentDidMount() {
    this._unsubscribe = AccountStore.listen(() => {
      this.setState({ accounts: AccountStore.accounts() });
    });
  }

  componentWillUnmount() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }

  // Map email domain to logo filename
  getLogoForAccount(email) {
    const domain = email.toLowerCase();

    if (domain.includes('lendwisemtg')) {
      return 'lendwise-owl.png';
    } else if (domain.includes('priorityfi')) {
      return 'priority-financial.jpg';
    } else if (domain.includes('onenationho')) {
      return 'one-nation.png';
    } else if (domain.includes('itravelvacation')) {
      return 'itravel.png';
    } else if (domain.includes('expressmtgcapi')) {
      return 'express-mortgage.jpg';
    } else if (domain.includes('gmail')) {
      return 'gmail'; // We'll use emoji for this
    }

    return null;
  }

  switchToAccount(account) {
    Actions.selectAccountId(account.id);
  }

  render() {
    const { accounts } = this.state;

    return (
      <div className="lendwise-account-switcher">
        <div className="lendwise-header">ACCOUNTS</div>
        <div className="lendwise-account-list">
          {accounts.map(account => {
            const logo = this.getLogoForAccount(account.emailAddress);

            return (
              <div
                key={account.id}
                className="lendwise-account-item"
                onClick={() => this.switchToAccount(account)}
              >
                <div className="lendwise-account-logo">
                  {logo === 'gmail' ? (
                    <span className="gmail-icon">📧</span>
                  ) : logo ? (
                    <img src={`mailspring://lendwise-account-switcher/assets/logos/${logo}`} />
                  ) : (
                    <span className="default-icon">📬</span>
                  )}
                </div>
                <div className="lendwise-account-info">
                  <div className="lendwise-account-name">{account.name || account.emailAddress}</div>
                  <div className="lendwise-account-email">{account.emailAddress}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

AccountSwitcher.displayName = 'LendWiseAccountSwitcher';

module.exports = AccountSwitcher;
