import { db } from '../firebase/config';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';

// Activity add karne ka function
export const addActivity = async (userId, type, details = {}) => {
  try {
    await addDoc(collection(db, 'activities'), {
      userId,
      type,           // 'key_generation', 'encryption', 'decryption'
      details,        // { publicKey, messageLength, etc. }
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding activity:', error);
  }
};

// User ki saari activities fetch karna
export const getUserActivities = async (userId) => {
  try {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() // Convert Firestore timestamp to JS Date
    }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};