import admin from 'firebase-admin';
import { Firestore, getFirestore } from 'firebase-admin/firestore'

const serviceAccount = require('./keys/signlanguage-39e1e-firebase-adminsdk-a1h4b-e7ee4ffee5.json');

export let db: Firestore;

export const initDB = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = getFirestore();
}