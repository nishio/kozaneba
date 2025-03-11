/**
 * Firebase Utilities
 * 
 * This file provides utility functions for Firebase operations to abstract
 * the Firebase v11 API and make it easier to use throughout the application.
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData,
  QueryConstraint
} from "firebase/firestore";
import { db } from "./init_firebase";
import { DocRef, DocData } from "./FirebaseShortTypename";

/**
 * Get a document by reference
 */
export const getDocument = async (docRef: DocRef): Promise<DocData | null> => {
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as DocData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
};

/**
 * Get a document by collection and ID
 */
export const getDocumentById = async (collectionName: string, docId: string): Promise<DocData | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    return getDocument(docRef);
  } catch (error) {
    console.error("Error getting document by ID:", error);
    return null;
  }
};

/**
 * Get all documents from a collection
 */
export const getCollection = async (collectionName: string): Promise<DocData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => doc.data() as DocData);
  } catch (error) {
    console.error("Error getting collection:", error);
    return [];
  }
};

/**
 * Query documents from a collection with constraints
 */
export const queryDocuments = async (
  collectionName: string, 
  constraints: QueryConstraint[]
): Promise<DocData[]> => {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as DocData);
  } catch (error) {
    console.error("Error querying documents:", error);
    return [];
  }
};

/**
 * Add a document to a collection
 */
export const addDocument = async (
  collectionName: string, 
  data: DocumentData
): Promise<DocRef | null> => {
  try {
    const docRef = doc(collection(db, collectionName));
    await setDoc(docRef, data);
    return docRef;
  } catch (error) {
    console.error("Error adding document:", error);
    return null;
  }
};

/**
 * Update a document
 */
export const updateDocument = async (
  docRef: DocRef, 
  data: Partial<DocumentData>
): Promise<boolean> => {
  try {
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error("Error updating document:", error);
    return false;
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (docRef: DocRef): Promise<boolean> => {
  try {
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    return false;
  }
};

/**
 * Create query constraints
 */
export const createWhereConstraint = (field: string, operator: string, value: any): QueryConstraint => {
  return where(field, operator as any, value);
};

export const createOrderByConstraint = (field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint => {
  return orderBy(field, direction);
};

export const createLimitConstraint = (limitCount: number): QueryConstraint => {
  return limit(limitCount);
};
