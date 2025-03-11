/**
 * Firebase UI Compatibility Layer
 * 
 * This file provides a compatibility layer for firebaseui with Firebase v11.
 * The original firebaseui package expects Firebase v8 with namespace-style imports,
 * but we're using Firebase v11 with modular imports.
 */

import * as firebaseui from 'firebaseui';
import { auth } from './init_firebase';
import { GoogleAuthProvider } from 'firebase/auth';

// Create a singleton instance of the FirebaseUI auth
const authUiInstance = new firebaseui.auth.AuthUI(auth);

// Wrapper for firebaseui that works with Firebase v11
export const firebaseUiWrapper = {
  // Start method that accepts the same parameters as the original
  start: (containerId: string, uiConfig: any) => {
    // Convert Firebase v11 provider IDs to the format expected by firebaseui
    if (uiConfig.signInOptions) {
      uiConfig.signInOptions = uiConfig.signInOptions.map((option: any) => {
        // If the option is 'google.com', return it as is
        if (option === 'google.com') {
          return option;
        }
        // If the option is googleAuthProvider.providerId, convert it to 'google.com'
        if (option === GoogleAuthProvider.PROVIDER_ID) {
          return 'google.com';
        }
        return option;
      });
    }

    // Start the UI with the modified config
    return authUiInstance.start(containerId, uiConfig);
  },

  // Pass through other methods from the original authui
  reset: () => authUiInstance.reset(),
  disableAutoSignIn: () => authUiInstance.disableAutoSignIn(),
  // Add other methods as needed
};

// Export the wrapper as authui for backward compatibility
export const authui = firebaseUiWrapper;
