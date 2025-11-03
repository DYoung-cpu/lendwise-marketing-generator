// LendWise Branding Plugin for Mailspring
// Adds company logos next to email accounts

module.exports = {
  activate() {
    console.log('✓ LendWise Branding Plugin Activated!');

    // Debug: Check if we can find account elements
    this.checkAccountElements();

    // Re-check after a delay to ensure DOM is loaded
    setTimeout(() => {
      this.checkAccountElements();
    }, 2000);

    // The CSS in styles/main.less will automatically be loaded
    console.log('✓ CSS stylesheet loaded from styles/main.less');
  },

  checkAccountElements() {
    // Debug function to verify selectors are working
    const selectors = [
      '.account-sidebar-item',
      '.account-switcher-item',
      '.accounts-account-item',
      '[data-account-id]'
    ];

    console.log('--- LendWise Branding: Checking for account elements ---');

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`✓ Found ${elements.length} elements for selector: ${selector}`);
        elements.forEach((el, index) => {
          console.log(`  Element ${index + 1}:`, {
            className: el.className,
            title: el.title,
            text: el.textContent?.substring(0, 50),
            dataset: el.dataset
          });
        });
      } else {
        console.log(`✗ No elements found for selector: ${selector}`);
      }
    });

    console.log('--- End account elements check ---');
  },

  deactivate() {
    console.log('LendWise Branding Plugin Deactivated');
  },

  serialize() {
    return {};
  }
};
