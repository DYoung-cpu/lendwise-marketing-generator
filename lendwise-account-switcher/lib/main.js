// LendWise Account Switcher Plugin
const { ComponentRegistry } = require('mailspring-exports');
const AccountSwitcher = require('./account-switcher');

module.exports = {
  activate() {
    console.log('✅ LendWise Account Switcher Activated!');

    ComponentRegistry.register(AccountSwitcher, {
      location: 'RootSidebar'
    });
  },

  deactivate() {
    console.log('LendWise Account Switcher Deactivated');
    ComponentRegistry.unregister(AccountSwitcher);
  },

  serialize() {
    return {};
  }
};
