/**
 * Firebase Mock Module
 * 
 * This file provides a mock implementation of Firebase v8 namespace-style imports
 * to make firebaseui work with Firebase v11.
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// Create a namespace-style Firebase mock for firebaseui
const firebase = {
  // App namespace
  app: {
    App: class App {
      constructor() {}
    }
  },
  
  // Initialize app function
  initializeApp: (config) => {
    return initializeApp(config);
  },
  
  // Auth namespace
  auth: {
    Auth: class Auth {
      constructor() {}
    },
    GoogleAuthProvider: GoogleAuthProvider,
    // Add other auth providers as needed
    
    // Factory function
    getAuth: getAuth
  },
  
  // Firestore namespace
  firestore: {
    Firestore: class Firestore {
      constructor() {}
    },
    // Factory function
    getFirestore: getFirestore,
    
    // Collection reference
    CollectionReference: class CollectionReference {
      constructor() {}
    },
    
    // Document reference
    DocumentReference: class DocumentReference {
      constructor() {}
    }
  }
};

// Add auth methods to the namespace
firebase.auth.signInWithPopup = signInWithPopup;
firebase.auth.signInAnonymously = signInAnonymously;

// Add firestore methods to the namespace
firebase.firestore.collection = collection;
firebase.firestore.doc = doc;
firebase.firestore.getDoc = getDoc;
firebase.firestore.getDocs = getDocs;
firebase.firestore.addDoc = addDoc;
firebase.firestore.setDoc = setDoc;
firebase.firestore.updateDoc = updateDoc;
firebase.firestore.deleteDoc = deleteDoc;
firebase.firestore.query = query;
firebase.firestore.where = where;
firebase.firestore.orderBy = orderBy;

// Export the mock
export default firebase;
