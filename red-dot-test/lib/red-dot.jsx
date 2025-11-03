// Red Dot Component - Just a simple red circle for testing
const React = require('react');

class RedDot extends React.Component {
  render() {
    return (
      <div className="red-dot-container">
        <div className="red-dot"></div>
      </div>
    );
  }
}

RedDot.displayName = 'RedDot';

module.exports = RedDot;
