// Red Dot Test Plugin
// Simple test to verify plugin loading works

const { ComponentRegistry } = require('mailspring-exports');
const RedDot = require('./red-dot');

module.exports = {
  activate() {
    console.log('🔴 RED DOT TEST PLUGIN ACTIVATED!');

    // Register our red dot component to appear in the center
    ComponentRegistry.register(RedDot, {
      location: 'RootSidebar'
    });
  },

  deactivate() {
    console.log('🔴 Red Dot Test Plugin Deactivated');
    ComponentRegistry.unregister(RedDot);
  }
};
