import { DocumentSnapshot, DocumentReference, DocumentData } from "firebase/firestore";

export type DocSnap = DocumentSnapshot<DocumentData>;

export type DocRef = DocumentReference<DocumentData>;

export type DocData = DocumentData;
