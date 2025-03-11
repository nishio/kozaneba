// Temporary solution to bypass firebaseui issues
export const authui = {
  start: (containerId, config) => {
    console.log('Firebase UI is temporarily disabled during migration');
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<div style="padding: 20px; text-align: center;">Firebase authentication UI is temporarily disabled during migration.<br>Please use the anonymous login option.</div>';
    }
  },
  reset: () => {}
};
