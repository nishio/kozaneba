const path = require('path');

module.exports = {
  // Add resolve.alias configuration
  resolve: {
    alias: {
      // Alias 'firebase/app' to our mock implementation
      'firebase/app': path.resolve(__dirname, 'src/Cloud/firebase-mock.js'),
      // Add other aliases as needed
    },
  },
};
