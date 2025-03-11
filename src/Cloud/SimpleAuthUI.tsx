import React, { useState } from 'react';
import { Button, TextField, Typography, Box, Divider } from '@mui/material';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleAuthProvider } from './init_firebase';

interface SimpleAuthUIProps {
  onSuccess: () => void;
  showAnonymousOption?: boolean;
}

/**
 * A simple authentication UI component to replace firebaseui
 * This is a temporary solution during the Firebase v11 migration
 */
export const SimpleAuthUI: React.FC<SimpleAuthUIProps> = ({ onSuccess, showAnonymousOption = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
      onSuccess();
    } catch (error) {
      setError('Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', error);
    }
  };

  const handleEmailAuth = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (error) {
      setError(`Email ${isSignUp ? 'sign-up' : 'sign-in'} failed. Please check your credentials.`);
      console.error('Email auth error:', error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {isSignUp ? 'Create Account' : 'Sign In'}
      </Typography>
      
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Button 
        variant="contained" 
        fullWidth 
        onClick={handleGoogleSignIn}
        sx={{ mb: 2 }}
      >
        Sign in with Google
      </Button>
      
      <Divider sx={{ my: 2 }}>or</Divider>
      
      <TextField
        label="Email"
        type="email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
      />
      
      <TextField
        label="Password"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />
      
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth
        onClick={handleEmailAuth}
        sx={{ mt: 2, mb: 1 }}
      >
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </Button>
      
      <Button 
        variant="text" 
        onClick={() => setIsSignUp(!isSignUp)}
        sx={{ mb: 2 }}
      >
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </Button>
      
      {showAnonymousOption && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 2 }}>or</Divider>
          <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
            Continue without an account
          </Typography>
          <Button 
            variant="outlined" 
            fullWidth
            onClick={onSuccess}
          >
            Continue as Guest
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Export a compatibility interface for the old authui
export const authui = {
  start: (containerId: string, config: any): void => {
    console.log('Firebase UI is temporarily disabled during migration');
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<div style="padding: 20px; text-align: center;">Firebase authentication UI is temporarily disabled during migration.<br>Please use the anonymous login option.</div>';
    }
  },
  reset: (): void => {}
};
